import { ValidationStateMachine } from '../state/ValidationStateMachine';
import { ValidationPlanningService } from '../services/ValidationPlanningService';
import { ValidatorSelectionService } from '../services/ValidatorSelectionService';
import { ValidationPipelineService } from '../services/ValidationPipelineService';
import { ValidationScoringService } from '../services/ValidationScoringService';
import { ValidationAggregationService } from '../services/ValidationAggregationService';
import { ValidationEvidenceService } from '../services/ValidationEvidenceService';
import { ValidationEventBus, ValidationEvents } from '../observability/ValidationEventBus';
import { ValidationMetrics } from '../metrics/ValidationMetrics';
import { ValidationLedger, EvidenceLedger, ScoreLedger, AggregationLedger, PipelineLedger, AuditLedger } from '../ledger/ValidationLedger';
import { ValidationStatus, ValidationSeverity } from '../models/ValidationEnums';

export class ValidationOrchestrationRuntime {
  constructor(
    private stateMachine: ValidationStateMachine,
    private planningService: ValidationPlanningService,
    private selectionService: ValidatorSelectionService,
    private pipelineService: ValidationPipelineService,
    private scoringService: ValidationScoringService,
    private aggregationService: ValidationAggregationService,
    private evidenceService: ValidationEvidenceService,
    private eventBus: ValidationEventBus,
    private metrics: ValidationMetrics,
    private auditLedger: AuditLedger,
    private evidenceLedger: EvidenceLedger,
    private scoreLedger: ScoreLedger,
    private aggregationLedger: AggregationLedger,
    private pipelineLedger: PipelineLedger
  ) {}

  public async runValidation(targetPayload: any, requiredValidators: string[], dependencies: {from: string, to: string}[]): Promise<any> {
    try {
      this.auditLedger.append({ event: 'ValidationStarted', targetPayload });

      // 1. PLANNING
      this.stateMachine.transition(ValidationStatus.PLANNING);
      const plan = this.planningService.createPlan(requiredValidators, dependencies, targetPayload);
      this.eventBus.publish(ValidationEvents.ValidationPlanCreated, plan);
      this.pipelineLedger.append({ type: 'PLAN_CREATED', planId: plan.validationPlanId });

      // 2. VALIDATOR SELECTION
      this.stateMachine.transition(ValidationStatus.VALIDATOR_SELECTED);
      const validators = this.selectionService.selectValidators(plan);
      this.eventBus.publish(ValidationEvents.ValidatorInitialized, Array.from(validators.keys()));

      // 3. READY
      this.stateMachine.transition(ValidationStatus.READY);

      // 4. VALIDATING
      this.stateMachine.transition(ValidationStatus.VALIDATING);
      this.eventBus.publish(ValidationEvents.ValidationStarted, plan.validationPlanId);
      const start = Date.now();
      const results = await this.pipelineService.executePipeline(plan, validators, targetPayload);
      const duration = Date.now() - start;
      this.metrics.recordDuration(duration);
      this.eventBus.publish(ValidationEvents.ValidationCompleted, results);

      // 5. EVIDENCE COLLECTION
      const evidences = this.evidenceService.collect(results);
      evidences.forEach(e => this.evidenceLedger.append(e));
      this.eventBus.publish(ValidationEvents.EvidenceCollected, evidences);

      // 6. SCORING
      results.forEach(res => {
        const score = this.scoringService.score(res);
        this.scoreLedger.append({ validatorId: res.validatorId, score });
      });
      this.eventBus.publish(ValidationEvents.ScoreCalculated, results);

      // 7. AGGREGATING
      this.stateMachine.transition(ValidationStatus.AGGREGATING);
      this.eventBus.publish(ValidationEvents.AggregationStarted, plan.validationPlanId);
      const aggregationResult = this.aggregationService.aggregate(results);
      this.aggregationLedger.append(aggregationResult);
      this.metrics.recordScore(aggregationResult.aggregatedScore, aggregationResult.overallConfidence);
      this.eventBus.publish(ValidationEvents.AggregationCompleted, aggregationResult);

      // 8. VERIFIED / FAILED
      if (aggregationResult.status === ValidationStatus.VERIFIED) {
        this.stateMachine.transition(ValidationStatus.VERIFIED);
        this.eventBus.publish(ValidationEvents.VerificationCompleted, aggregationResult);
      } else {
        this.stateMachine.transition(ValidationStatus.FAILED);
        this.eventBus.publish(ValidationEvents.ValidationFailed, aggregationResult);
      }

      // 9. COMPLETED -> ARCHIVED
      if (this.stateMachine.getState() === ValidationStatus.VERIFIED) {
        this.stateMachine.transition(ValidationStatus.COMPLETED);
      }
      this.stateMachine.transition(ValidationStatus.ARCHIVED);
      this.eventBus.publish(ValidationEvents.ValidationArchived, plan.validationPlanId);

      this.auditLedger.append({ event: 'ValidationFinished', finalState: this.stateMachine.getState(), aggregationResult });

      return {
        plan,
        results,
        aggregationResult,
        finalState: this.stateMachine.getState()
      };
    } catch (error: any) {
      this.stateMachine.transition(ValidationStatus.FAILED);
      this.eventBus.publish(ValidationEvents.ValidationFailed, error);
      this.auditLedger.append({ event: 'ValidationFailedWithError', error: error.message });
      throw error;
    }
  }
}
