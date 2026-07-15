import { PromotionStateMachine } from '../state/PromotionStateMachine';
import { PromotionState, ConflictType } from '../models/PromotionEnums';
import { PromotionCandidate } from '../models/PromotionCandidate';
import { CandidateAssessmentService } from '../services/CandidateAssessmentService';
import { KnowledgeMergeEngine } from '../services/KnowledgeMergeEngine';
import { PromotionEventBus } from '../observability/PromotionEventBus';
import { PromotionMetrics } from '../metrics/PromotionMetrics';
import { 
  PromotionLedger, MergeLedger, ConflictLedger, VersionLedger, 
  LineageLedger, AuditLedger, CandidateLedger, KnowledgeLedger 
} from '../ledger/PromotionLedger';

export class KnowledgePromotionRuntime {
  private currentState: PromotionState = PromotionState.CREATED;

  constructor(
    private stateMachine: PromotionStateMachine,
    private assessmentService: CandidateAssessmentService,
    private mergeEngine: KnowledgeMergeEngine,
    private eventBus: PromotionEventBus,
    private metrics: PromotionMetrics,
    private ledgers: {
      promotion: PromotionLedger,
      merge: MergeLedger,
      conflict: ConflictLedger,
      version: VersionLedger,
      lineage: LineageLedger,
      audit: AuditLedger,
      candidate: CandidateLedger,
      knowledge: KnowledgeLedger
    }
  ) {}

  private async transitionTo(nextState: PromotionState, payload?: any): Promise<void> {
    if (!this.stateMachine.canTransition(this.currentState, nextState)) {
      throw new Error(`Invalid state transition from ${this.currentState} to ${nextState}`);
    }
    this.currentState = nextState;
    this.eventBus.publish(`StateTransitioned:${nextState}`, payload);
  }

  public async promote(candidate: PromotionCandidate): Promise<{ finalState: PromotionState, version?: any }> {
    try {
      this.ledgers.audit.append({ action: 'START_PROMOTION', candidateId: candidate.candidateId });
      this.ledgers.candidate.append(candidate);
      this.eventBus.publish('PromotionCandidateCreated', candidate);
      this.metrics.recordPromotionAttempt();

      // ASSESSING
      await this.transitionTo(PromotionState.ASSESSING);
      this.eventBus.publish('PromotionAssessmentStarted', { candidateId: candidate.candidateId });

      // QUALITY_CHECK
      await this.transitionTo(PromotionState.QUALITY_CHECK);
      const isApproved = this.assessmentService.assess(candidate);
      if (!isApproved) {
        this.eventBus.publish('PromotionRejected', { reason: 'Failed Quality Check' });
        await this.transitionTo(PromotionState.REJECTED);
        this.metrics.recordPromotionRejection();
        await this.transitionTo(PromotionState.ARCHIVED);
        return { finalState: this.currentState };
      }
      this.eventBus.publish('QualityChecked', { status: 'PASS' });

      // CONFLICT_ANALYSIS
      await this.transitionTo(PromotionState.CONFLICT_ANALYSIS);
      // In a real flow, conflict detection runs before generating the merge plan or inside the engine.
      // Here, the engine handles the full merge sequence. We will catch the conflict error.

      // READY
      await this.transitionTo(PromotionState.READY);
      
      // VERSIONING -> PROMOTING
      await this.transitionTo(PromotionState.VERSIONING);
      
      // The Engine does conflict -> simulate -> version -> lineage -> commit
      const mergeResult = await this.mergeEngine.executeMerge(candidate);

      await this.transitionTo(PromotionState.PROMOTING);
      
      // PROMOTED
      await this.transitionTo(PromotionState.PROMOTED);
      this.metrics.recordPromotionSuccess(candidate.qualityScore);
      this.eventBus.publish('PromotionApproved', { version: mergeResult.version });
      this.ledgers.knowledge.append(mergeResult);
      this.ledgers.version.append(mergeResult.version);
      this.ledgers.lineage.append(mergeResult.lineage);

      await this.transitionTo(PromotionState.ARCHIVED);
      this.eventBus.publish('PromotionArchived', { candidateId: candidate.candidateId });

      return { finalState: this.currentState, version: mergeResult.version };

    } catch (err: any) {
      if (err.message.includes('Conflict detected')) {
        this.eventBus.publish('ConflictDetected', { message: err.message });
        this.ledgers.conflict.append({ error: err.message, timestamp: new Date() });
        this.metrics.recordConflict();
      }
      
      this.eventBus.publish('PromotionRejected', { reason: err.message });
      await this.transitionTo(PromotionState.REJECTED);
      this.metrics.recordPromotionRejection();
      await this.transitionTo(PromotionState.ARCHIVED);
      return { finalState: this.currentState };
    }
  }
}
