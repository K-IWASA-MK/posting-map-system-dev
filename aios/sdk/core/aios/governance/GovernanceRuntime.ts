import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeHealth } from '../runtime/RuntimeHealth';
import { AIOSEventBus } from '../event/AIOSEventBus';
import crypto from 'crypto';

import { GovernanceManifest } from './GovernanceManifest';
import { GovernancePolicy } from './GovernancePolicy';
import { GovernanceRegistry } from './GovernanceRegistry';
import { GovernanceState } from './GovernanceState';
import { GovernanceSession } from './GovernanceSession';

import { GovernanceEvaluationService } from './services/GovernanceEvaluationService';
import { PolicyResolutionService } from './services/PolicyResolutionService';
import { DependencyImpactService } from './services/DependencyImpactService';
import { ApprovalDecisionService } from './services/ApprovalDecisionService';
import { ComplianceValidationService } from './services/ComplianceValidationService';
import { RuntimeIsolationService } from './services/RuntimeIsolationService';

import { GovernanceStateMachine } from './state/GovernanceStateMachine';
import { GovernanceLedger } from './ledger/GovernanceLedger';
import { GovernanceMetrics } from './metrics/GovernanceMetrics';
import { GovernanceObservability } from './observability/GovernanceObservability';

import { GovernanceRequest } from './models/GovernanceRequest';
import { GovernanceDecision } from './models/GovernanceDecision';

export class GovernanceRuntime implements IRuntime<GovernanceManifest, void> {
    public readonly descriptor: RuntimeDescriptor = {
        runtimeId: 'adaptive-governance-runtime',
        runtimeName: 'Adaptive Governance Runtime',
        version: 'v4.1.0-alpha.0',
        contractVersion: '1.0',
        capabilities: [
            'CAN_EVALUATE_POLICY' as any,
            'CAN_APPROVE_EXECUTION' as any,
            'CAN_REJECT_EXECUTION' as any,
            'CAN_RESOLVE_POLICY' as any,
            'CAN_VALIDATE_COMPLIANCE' as any,
            'CAN_ENFORCE_GOVERNANCE' as any,
            'CAN_ISOLATE_RUNTIME' as any,
            'CAN_DEFER_EXECUTION' as any,
            'CAN_APPLY_CONDITIONS' as any,
            'CAN_SCORE_GOVERNANCE' as any,
            'CAN_VALIDATE_DEPENDENCY' as any,
            'CAN_EVALUATE_ISOLATION' as any
        ],
        dependencies: []
    };

    private context?: RuntimeContext;
    private eventBus?: AIOSEventBus;

    constructor(
        private policy: GovernancePolicy,
        private registry: GovernanceRegistry,
        private stateMachine: GovernanceStateMachine,
        private ledger: GovernanceLedger,
        private metrics: GovernanceMetrics,
        private observability: GovernanceObservability,
        private evaluationService: GovernanceEvaluationService,
        private resolutionService: PolicyResolutionService,
        private impactService: DependencyImpactService,
        private decisionService: ApprovalDecisionService,
        private complianceService: ComplianceValidationService,
        private isolationService: RuntimeIsolationService
    ) {}

    public async initialize(context: RuntimeContext): Promise<void> {
        this.context = context;
        this.eventBus = (context as any).eventBus;
    }

    public async execute(manifest: GovernanceManifest): Promise<void> {}

    public async evaluateRequest(request: GovernanceRequest): Promise<GovernanceDecision> {
        const sessionId = crypto.randomUUID();
        const session: GovernanceSession = {
            sessionId,
            requestId: request.requestId,
            correlationId: crypto.randomUUID(),
            startedAt: new Date().toISOString(),
            status: GovernanceState.CREATED
        };
        
        this.registry.registerSession(session);
        this.metrics.recordRequest();
        this.publishEvent('GovernanceStarted', { sessionId, requestId: request.requestId });
        
        const startTime = Date.now();

        try {
            // 1. EVALUATING_POLICY
            this.stateMachine.transition(session, GovernanceState.EVALUATING_POLICY);
            const isPolicyMet = await this.evaluationService.evaluate(request);
            if (!isPolicyMet) {
                this.metrics.recordPolicyConflict();
                this.publishEvent('PolicyConflictDetected', { sessionId, requestId: request.requestId });
                
                // For Foundation, we just reject if policy fails
                this.stateMachine.transition(session, GovernanceState.REJECTED);
                this.stateMachine.transition(session, GovernanceState.ARCHIVED);
                this.metrics.recordDecision('REJECTED');
                this.metrics.recordTime(Date.now() - startTime);
                
                return this.createRejectionDecision(request, 'Policy requirements not met');
            }
            this.publishEvent('PolicyEvaluated', { sessionId, requestId: request.requestId });

            // 2. ANALYZING_IMPACT
            this.stateMachine.transition(session, GovernanceState.ANALYZING_IMPACT);
            const impact = await this.impactService.analyze(request);
            this.registry.registerImpact(impact);
            this.publishEvent('ImpactAnalyzed', { sessionId, impact });

            // 3. VALIDATING_COMPLIANCE
            this.stateMachine.transition(session, GovernanceState.VALIDATING_COMPLIANCE);
            const compliance = await this.complianceService.validate(request);
            this.registry.registerCompliance(compliance);
            this.publishEvent('ComplianceValidated', { sessionId, compliance });

            // 4. DECIDING
            this.stateMachine.transition(session, GovernanceState.DECIDING);
            const decision = await this.decisionService.decide(request, impact, compliance);
            this.registry.registerDecision(decision);
            
            this.metrics.recordDecision(decision.status);

            if (decision.status === 'REJECTED') {
                this.stateMachine.transition(session, GovernanceState.REJECTED);
                this.publishEvent('DecisionMade', { sessionId, decision });
                this.stateMachine.transition(session, GovernanceState.ARCHIVED);
                this.metrics.recordTime(Date.now() - startTime);
                return decision;
            } else if (decision.status === 'DEFERRED') {
                this.stateMachine.transition(session, GovernanceState.DEFERRED);
                this.publishEvent('GovernanceDeferred', { sessionId, decision });
                this.publishEvent('DecisionMade', { sessionId, decision });
                this.stateMachine.transition(session, GovernanceState.ARCHIVED);
                this.metrics.recordTime(Date.now() - startTime);
                return decision;
            }

            // Status is APPROVED or APPROVED_WITH_CONDITIONS
            this.stateMachine.transition(session, GovernanceState.APPROVED);
            this.publishEvent('DecisionMade', { sessionId, decision });

            // 5. CONDITION_CHECKED
            this.stateMachine.transition(session, GovernanceState.CONDITION_CHECKED);
            if (decision.status === 'APPROVED_WITH_CONDITIONS') {
                this.publishEvent('GovernanceConditionApplied', { sessionId, conditions: decision.requiredConditions });
            }

            // 6. ENFORCING
            this.stateMachine.transition(session, GovernanceState.ENFORCING);
            this.publishEvent('EnforcementStarted', { sessionId });
            await this.isolationService.enforce(decision);
            this.metrics.recordIsolation();
            this.publishEvent('IsolationApplied', { sessionId, level: decision.isolationLevel });

            // 7. ARCHIVED
            this.stateMachine.transition(session, GovernanceState.ARCHIVED);
            this.metrics.recordTime(Date.now() - startTime);
            this.publishEvent('GovernanceCompleted', { sessionId, timeMs: Date.now() - startTime });

            return decision;

        } catch (error) {
            this.stateMachine.transition(session, GovernanceState.REJECTED);
            this.stateMachine.transition(session, GovernanceState.ARCHIVED);
            this.metrics.recordTime(Date.now() - startTime);
            throw error;
        }
    }

    private createRejectionDecision(request: GovernanceRequest, reason: string): GovernanceDecision {
        return {
            decisionId: crypto.randomUUID(),
            requestId: request.requestId,
            status: 'REJECTED',
            decisionReason: reason,
            decisionScore: 0,
            decisionConfidence: 1.0,
            requiredConditions: [],
            isolationLevel: 'NONE',
            expiry: new Date().toISOString(),
            decisionTimestamp: new Date().toISOString()
        };
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

    public async getHealth(): Promise<RuntimeHealth> {
        const isHealthy = this.observability.checkHealth();
        return {
            status: (isHealthy ? 'HEALTHY' : 'DEGRADED') as any,
            lastCheckedAt: new Date().toISOString(),
            details: this.observability.getStatusReport()
        };
    }

    public async pause(): Promise<void> {}
    public async resume(): Promise<void> {}
    public async shutdown(): Promise<void> {}
    
    public async validate(manifest: GovernanceManifest): Promise<void> {}
}
