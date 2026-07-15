import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeHealth } from '../runtime/RuntimeHealth';
import { AIOSEventBus } from '../event/AIOSEventBus';
import crypto from 'crypto';

import { AutonomousManifest } from './AutonomousManifest';
import { AutonomousPolicy } from './AutonomousPolicy';
import { AutonomousRegistry } from './AutonomousRegistry';
import { AutonomousState } from './AutonomousState';
import { AutonomousSession } from './AutonomousSession';
import { AutonomousContext as Context } from './AutonomousContext';

import { ProposalEvaluationService } from './services/ProposalEvaluationService';
import { RiskAnalysisService } from './services/RiskAnalysisService';
import { ExecutionPlanningService } from './services/ExecutionPlanningService';
import { ImprovementExecutionService } from './services/ImprovementExecutionService';
import { ValidationService } from './services/ValidationService';
import { RollbackService } from './services/RollbackService';

import { AutonomousStateMachine } from './state/AutonomousStateMachine';
import { AutonomousLedger } from './ledger/AutonomousLedger';
import { AutonomousMetrics } from './metrics/AutonomousMetrics';
import { AutonomousObservability } from './observability/AutonomousObservability';

import { ImprovementProposal } from './models/ImprovementProposal';
import { ValidationResult } from './models/ValidationResult';

export class AutonomousRuntime implements IRuntime<AutonomousManifest, void> {
    public readonly descriptor: RuntimeDescriptor = {
        runtimeId: 'autonomous-improvement-runtime',
        runtimeName: 'Autonomous Improvement Runtime',
        version: 'v4.0.0-alpha.0',
        contractVersion: '1.0',
        capabilities: [
            'CAN_EVALUATE_PROPOSAL' as any,
            'CAN_ANALYZE_RISK' as any,
            'CAN_GENERATE_PLAN' as any,
            'CAN_EXECUTE_IMPROVEMENT' as any,
            'CAN_VALIDATE' as any,
            'CAN_ROLLBACK' as any,
            'CAN_APPROVE_IMPROVEMENT' as any,
            'CAN_PROMOTE_KNOWLEDGE' as any,
            'CAN_VERIFY_RESULT' as any,
            'CAN_ARCHIVE_SESSION' as any
        ],
        dependencies: []
    };

    private context?: RuntimeContext;
    private eventBus?: AIOSEventBus;

    constructor(
        private policy: AutonomousPolicy,
        private registry: AutonomousRegistry,
        private stateMachine: AutonomousStateMachine,
        private ledger: AutonomousLedger,
        private metrics: AutonomousMetrics,
        private observability: AutonomousObservability,
        private evaluationService: ProposalEvaluationService,
        private riskAnalysisService: RiskAnalysisService,
        private planningService: ExecutionPlanningService,
        private executionService: ImprovementExecutionService,
        private validationService: ValidationService,
        private rollbackService: RollbackService
    ) {}

    public async initialize(context: RuntimeContext): Promise<void> {
        this.context = context;
        this.eventBus = (context as any).eventBus;
    }

    public async execute(manifest: AutonomousManifest): Promise<void> {}

    public async runImprovementCycle(proposal: ImprovementProposal): Promise<ValidationResult> {
        const sessionId = crypto.randomUUID();
        const session: AutonomousSession = {
            sessionId,
            proposalId: proposal.proposalId,
            correlationId: crypto.randomUUID(),
            startedAt: new Date().toISOString(),
            status: AutonomousState.CREATED
        };
        
        this.registry.registerSession(session);
        this.publishEvent('ImprovementStarted', { sessionId, proposalId: proposal.proposalId });
        
        const startTime = Date.now();

        try {
            // 1. EVALUATING
            this.stateMachine.transition(session, AutonomousState.EVALUATING);
            const isApproved = await this.evaluationService.evaluate(proposal);
            this.metrics.recordProposal(isApproved);
            
            if (!isApproved) {
                this.publishEvent('ProposalRejected', { sessionId, proposalId: proposal.proposalId });
                this.stateMachine.transition(session, AutonomousState.ROLLING_BACK);
                this.stateMachine.transition(session, AutonomousState.ARCHIVED);
                return this.createFailedValidation('Proposal was rejected during evaluation');
            }
            this.publishEvent('ProposalEvaluated', { sessionId, proposalId: proposal.proposalId });

            // 2. RISK_ANALYZED
            this.stateMachine.transition(session, AutonomousState.RISK_ANALYZED);
            const riskProfile = await this.riskAnalysisService.analyze(proposal);
            this.metrics.recordRisk(riskProfile.riskCategory);
            this.publishEvent('RiskAnalyzed', { sessionId, riskProfile });

            // 3. PLANNED
            this.stateMachine.transition(session, AutonomousState.PLANNED);
            const plan = await this.planningService.generatePlan(proposal, riskProfile);
            this.registry.registerPlan(plan);
            this.publishEvent('PlanGenerated', { sessionId, planId: plan.planId });

            // 4. APPROVED (Auto-approve for foundation)
            this.stateMachine.transition(session, AutonomousState.APPROVED);
            
            // 5. EXECUTING
            this.stateMachine.transition(session, AutonomousState.EXECUTING);
            this.publishEvent('ExecutionStarted', { sessionId, planId: plan.planId });
            await this.executionService.execute(plan);
            
            // 6. VALIDATING
            this.stateMachine.transition(session, AutonomousState.VALIDATING);
            const validationResult = await this.validationService.validate(plan);
            this.metrics.recordValidation(validationResult.isSuccessful);

            if (!validationResult.isSuccessful) {
                this.publishEvent('ValidationFailed', { sessionId, validationResult });
                // 7. ROLLING_BACK
                this.stateMachine.transition(session, AutonomousState.ROLLING_BACK);
                this.publishEvent('RollbackTriggered', { sessionId });
                
                await this.rollbackService.rollback({
                    rollbackPlanId: crypto.randomUUID(),
                    planId: plan.planId,
                    rollbackSnapshot: 'snapshot-1',
                    rollbackTrigger: 'ValidationFailed',
                    rollbackReason: validationResult.validationSummary,
                    steps: [],
                    createdAt: new Date().toISOString()
                });
                this.metrics.recordRollback();
                this.publishEvent('RollbackCompleted', { sessionId });
                this.stateMachine.transition(session, AutonomousState.ARCHIVED);
                
                this.metrics.recordExecution(false, Date.now() - startTime);
                return validationResult;
            }

            // 8. VERIFIED
            this.stateMachine.transition(session, AutonomousState.VERIFIED);
            this.publishEvent('ValidationPassed', { sessionId });

            // 9. PROMOTED
            this.stateMachine.transition(session, AutonomousState.PROMOTED);
            this.metrics.recordPromotion();
            this.publishEvent('KnowledgePromoted', { sessionId });

            // DONE
            this.stateMachine.transition(session, AutonomousState.ARCHIVED);
            this.metrics.recordExecution(true, Date.now() - startTime);
            this.publishEvent('ImprovementCompleted', { sessionId, timeMs: Date.now() - startTime });

            return validationResult;

        } catch (error) {
            this.stateMachine.transition(session, AutonomousState.ROLLING_BACK);
            this.stateMachine.transition(session, AutonomousState.ARCHIVED);
            this.metrics.recordExecution(false, Date.now() - startTime);
            throw error;
        }
    }

    private createFailedValidation(reason: string): ValidationResult {
        return {
            resultId: crypto.randomUUID(),
            planId: '',
            validationRule: 'System',
            validationEvidence: reason,
            validationScore: 0,
            validationSummary: reason,
            validationArtifact: '',
            isSuccessful: false,
            validatedAt: new Date().toISOString()
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
    
    public async validate(manifest: AutonomousManifest): Promise<void> {}
}
