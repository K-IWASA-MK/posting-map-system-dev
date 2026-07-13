import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeHealth } from '../runtime/RuntimeHealth';
import { AIOSEventBus } from '../event/AIOSEventBus';
import crypto from 'crypto';

import { OrchestrationManifest } from './OrchestrationManifest';
import { OrchestrationPolicy } from './OrchestrationPolicy';
import { OrchestrationRegistry } from './OrchestrationRegistry';
import { OrchestrationState } from './OrchestrationState';
import { OrchestrationSession } from './OrchestrationSession';

import { ExecutionOrchestrationService } from './services/ExecutionOrchestrationService';
import { ExecutionSchedulingService } from './services/ExecutionSchedulingService';
import { DependencyResolutionService } from './services/DependencyResolutionService';
import { RuntimeLockService } from './services/RuntimeLockService';
import { ExecutionContextService } from './services/ExecutionContextService';
import { RetryPolicyService } from './services/RetryPolicyService';
import { TimeoutManagementService } from './services/TimeoutManagementService';
import { CancellationService } from './services/CancellationService';
import { PauseResumeService } from './services/PauseResumeService';

import { OrchestrationStateMachine } from './state/OrchestrationStateMachine';
import { OrchestrationLedger } from './ledger/OrchestrationLedger';
import { OrchestrationMetrics } from './metrics/OrchestrationMetrics';
import { OrchestrationObservability } from './observability/OrchestrationObservability';

import { ExecutionJob } from './models/ExecutionJob';
import { RuntimeLock } from './models/RuntimeLock';
import { RetryProfile } from './models/RetryProfile';

export class OrchestrationRuntime implements IRuntime<OrchestrationManifest, void> {
    public readonly descriptor: RuntimeDescriptor = {
        runtimeId: 'execution-orchestration-runtime',
        runtimeName: 'Execution Orchestration Runtime',
        version: 'v4.2.0-alpha.0',
        contractVersion: '1.0',
        capabilities: [
            'CAN_ORCHESTRATE_EXECUTION' as any,
            'CAN_SCHEDULE_JOB' as any,
            'CAN_RESOLVE_DEPENDENCY' as any,
            'CAN_MANAGE_LOCKS' as any,
            'CAN_RETRY_EXECUTION' as any,
            'CAN_PAUSE_EXECUTION' as any,
            'CAN_RESUME_EXECUTION' as any,
            'CAN_CANCEL_EXECUTION' as any,
            'CAN_DISPATCH_EXECUTION' as any,
            'CAN_VALIDATE_DEPENDENCY' as any,
            'CAN_MANAGE_QUEUE' as any,
            'CAN_HANDLE_TIMEOUT' as any,
            'CAN_RESTORE_CONTEXT' as any
        ],
        dependencies: []
    };

    private context?: RuntimeContext;
    private eventBus?: AIOSEventBus;

    constructor(
        private policy: OrchestrationPolicy,
        private registry: OrchestrationRegistry,
        private stateMachine: OrchestrationStateMachine,
        private ledger: OrchestrationLedger,
        private metrics: OrchestrationMetrics,
        private observability: OrchestrationObservability,
        private orchestrationService: ExecutionOrchestrationService,
        private schedulingService: ExecutionSchedulingService,
        private dependencyService: DependencyResolutionService,
        private lockService: RuntimeLockService,
        private contextService: ExecutionContextService,
        private retryService: RetryPolicyService,
        private timeoutService: TimeoutManagementService,
        private cancelService: CancellationService,
        private pauseService: PauseResumeService
    ) {}

    public async initialize(context: RuntimeContext): Promise<void> {
        this.context = context;
        this.eventBus = (context as any).eventBus;
    }

    public async execute(manifest: OrchestrationManifest): Promise<void> {}

    public async orchestrate(job: ExecutionJob): Promise<boolean> {
        const sessionId = crypto.randomUUID();
        const session: OrchestrationSession = {
            sessionId,
            job,
            status: OrchestrationState.CREATED,
            startedAt: new Date().toISOString(),
            currentRetryCount: 0
        };

        this.registry.registerSession(session);
        this.metrics.recordJob();
        this.publishEvent('OrchestrationStarted', { sessionId, jobId: job.jobId });
        
        const startTime = Date.now();
        let lock: RuntimeLock | null = null;
        let wasCompleted = false;

        try {
            // 1. PLANNING
            this.stateMachine.transition(session, OrchestrationState.PLANNING);
            const t0 = Date.now();
            const steps = await this.dependencyService.resolve(job);
            this.metrics.recordDependencyResolution(Date.now() - t0);
            this.publishEvent('DependenciesResolved', { sessionId, steps: steps.length });

            // 2. SCHEDULING
            this.stateMachine.transition(session, OrchestrationState.SCHEDULING);
            const schedule = await this.schedulingService.schedule(job, steps);
            this.registry.registerSchedule(schedule);
            
            // Acquire Lock
            lock = await this.lockService.lock(job.jobId, job.targetRuntime);
            this.registry.registerLock(lock);
            this.publishEvent('RuntimeLocked', { sessionId, lockId: lock.lockId });

            this.publishEvent('JobScheduled', { sessionId, scheduleId: schedule.scheduleId });
            this.publishEvent('SchedulingCompleted', { sessionId, scheduleId: schedule.scheduleId });

            // 3. READY
            this.stateMachine.transition(session, OrchestrationState.READY);

            while (session.status !== OrchestrationState.COMPLETED && session.status !== OrchestrationState.CANCELLED) {
                // 4. DISPATCHING
                if (session.status === OrchestrationState.READY) {
                    this.stateMachine.transition(session, OrchestrationState.DISPATCHING);
                    const t1 = Date.now();
                    this.publishEvent('ExecutionDispatched', { sessionId, jobId: job.jobId });
                    this.metrics.recordDispatchLatency(Date.now() - t1);
                }

                // 5. EXECUTING
                if (session.status === OrchestrationState.DISPATCHING || session.status === OrchestrationState.RETRYING || session.status === OrchestrationState.RESUMED) {
                    this.stateMachine.transition(session, OrchestrationState.EXECUTING);
                    this.publishEvent('ExecutionStarted', { sessionId, jobId: job.jobId });
                }

                const success = await this.orchestrationService.dispatch(job, steps);

                if (success) {
                    this.stateMachine.transition(session, OrchestrationState.COMPLETED);
                    this.publishEvent('ExecutionCompleted', { sessionId, jobId: job.jobId });
                } else {
                    this.stateMachine.transition(session, OrchestrationState.FAILED);
                    this.publishEvent('ExecutionFailed', { sessionId, jobId: job.jobId });
                    
                    if (session.currentRetryCount < this.policy.retryPolicy.globalRetryLimit) {
                        session.currentRetryCount++;
                        this.stateMachine.transition(session, OrchestrationState.RETRYING);
                        this.metrics.recordRetry();
                        this.publishEvent('ExecutionRetrying', { sessionId, retryCount: session.currentRetryCount });
                        
                        const retryProfile: RetryProfile = {
                            profileId: crypto.randomUUID(),
                            jobId: job.jobId,
                            retryCount: session.currentRetryCount,
                            maxRetry: this.policy.retryPolicy.globalRetryLimit,
                            backoffStrategy: 'LINEAR',
                            retryDelay: 10, // fast for tests
                            retryReason: 'Execution Failed',
                            lastFailure: new Date().toISOString(),
                            retryPolicyId: 'default'
                        };
                        await this.retryService.waitBeforeRetry(retryProfile);
                    } else {
                        this.stateMachine.transition(session, OrchestrationState.CANCELLED);
                        this.metrics.recordCancel();
                        this.publishEvent('ExecutionCancelled', { sessionId, jobId: job.jobId, reason: 'Retry limit reached' });
                    }
                }
            }

        } catch (error) {
            this.stateMachine.transition(session, OrchestrationState.FAILED);
            this.stateMachine.transition(session, OrchestrationState.CANCELLED);
            this.metrics.recordFailure();
            this.publishEvent('ExecutionCancelled', { sessionId, jobId: job.jobId, reason: (error as Error).message });
        } finally {
            if (lock) {
                await this.lockService.unlock(lock);
                this.publishEvent('RuntimeUnlocked', { sessionId, lockId: lock.lockId });
            }
            
            wasCompleted = session.status === OrchestrationState.COMPLETED;
            
            this.stateMachine.transition(session, OrchestrationState.ARCHIVED);
            
            if (wasCompleted) {
                this.metrics.recordCompletion(Date.now() - startTime);
            } else {
                this.metrics.recordFailure();
            }
            this.publishEvent('OrchestrationCompleted', { sessionId, status: session.status });
        }

        return wasCompleted;
    }

    private publishEvent(eventType: string, payload: any): void {
        if (this.eventBus) {
            this.eventBus.publish({
                eventId: crypto.randomUUID(),
                eventType,
                eventVersion: '1.0',
                occurredAt: new Date().toISOString(),
                producerRuntimeId: this.descriptor.runtimeId,
                correlationId: crypto.randomUUID(),
                causationId: crypto.randomUUID(),
                payload
            });
        }
    }

    public async pause(jobId?: string): Promise<void> {
        if (!jobId) return;
        // Find session by job id
        const session = Array.from((this.registry as any).sessions.values()).find((s: any) => s.job.jobId === jobId) as OrchestrationSession;
        if (session && session.status === OrchestrationState.EXECUTING) {
            this.stateMachine.transition(session, OrchestrationState.PAUSED);
            this.metrics.recordPause();
            this.publishEvent('ExecutionPaused', { sessionId: session.sessionId, jobId });
        }
    }

    public async resume(jobId?: string): Promise<void> {
        const session = Array.from((this.registry as any).sessions.values()).find((s: any) => s.job.jobId === jobId) as OrchestrationSession;
        if (session && session.status === OrchestrationState.PAUSED) {
            this.stateMachine.transition(session, OrchestrationState.RESUMED);
            this.publishEvent('ExecutionResumed', { sessionId: session.sessionId, jobId });
            this.stateMachine.transition(session, OrchestrationState.EXECUTING);
        }
    }

    public async getHealth(): Promise<RuntimeHealth> {
        const isHealthy = this.observability.checkHealth();
        return {
            status: (isHealthy ? 'HEALTHY' : 'DEGRADED') as any,
            lastCheckedAt: new Date().toISOString(),
            details: this.observability.getStatusReport()
        };
    }

    public async shutdown(): Promise<void> {}
    public async validate(manifest: OrchestrationManifest): Promise<void> {}
}
