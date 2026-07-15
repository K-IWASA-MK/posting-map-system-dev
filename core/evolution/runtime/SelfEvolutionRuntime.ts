import { EvolutionStateMachine } from '../state/EvolutionStateMachine';
import { EvolutionEventBus } from '../observability/EvolutionEventBus';
import { EvolutionMetrics } from '../metrics/EvolutionMetrics';
import { EvolutionCandidate } from '../models/EvolutionCandidate';
import { EvolutionPlan } from '../models/EvolutionPlan';
import { EvolutionState } from '../models/EvolutionEnums';
import { StrategySelectionService, EvolutionPlanningService } from '../services/EvolutionPlanningService';
import { EvolutionSimulationService } from '../services/EvolutionSimulationService';
import { EvolutionApprovalService } from '../services/EvolutionApprovalService';

export class SelfEvolutionRuntime {
  constructor(
    private stateMachine: EvolutionStateMachine,
    private strategySelection: StrategySelectionService,
    private planningService: EvolutionPlanningService,
    private simulationService: EvolutionSimulationService,
    private approvalService: EvolutionApprovalService,
    private eventBus: EvolutionEventBus,
    private metrics: EvolutionMetrics,
    private ledgers: any // simplified for Foundation
  ) {}

  async evolve(candidate: EvolutionCandidate): Promise<{ finalState: EvolutionState, plan?: EvolutionPlan }> {
    try {
      // 1. CREATED
      this.eventBus.publish('EvolutionCandidateCreated', candidate);
      this.ledgers.candidate.append('CREATE', candidate);

      // 2. ANALYZING
      this.stateMachine.transitionTo(EvolutionState.ANALYZING);
      this.eventBus.publish(`StateTransitioned:${EvolutionState.ANALYZING}`);
      
      const strategy = this.strategySelection.selectStrategy(candidate);
      candidate.strategy = strategy;
      this.eventBus.publish('StrategySelected', { strategy });
      this.ledgers.strategy.append('SELECT', { strategy });

      // 3. PLANNING
      this.stateMachine.transitionTo(EvolutionState.PLANNING);
      this.eventBus.publish(`StateTransitioned:${EvolutionState.PLANNING}`);

      const plan = this.planningService.plan(candidate);
      this.eventBus.publish('EvolutionPlanned', plan);
      this.ledgers.plan.append('CREATE', plan);

      // 4. SIMULATING
      this.stateMachine.transitionTo(EvolutionState.SIMULATING);
      this.eventBus.publish(`StateTransitioned:${EvolutionState.SIMULATING}`);
      this.eventBus.publish('SimulationStarted', { candidateId: candidate.candidateId });

      const simStart = Date.now();
      const simResult = await this.simulationService.simulate(candidate, plan);
      this.metrics.recordSimulationDuration(Date.now() - simStart);

      this.eventBus.publish('SimulationCompleted', simResult);
      this.ledgers.simulation.append('RESULT', simResult);

      if (!simResult.passed) {
        // Reject and Archive
        this.stateMachine.transitionTo(EvolutionState.REJECTED);
        this.eventBus.publish(`StateTransitioned:${EvolutionState.REJECTED}`);
        this.eventBus.publish('EvolutionRejected', { reason: 'Simulation Failed' });
        this.archive(candidate);
        this.metrics.recordStrategyUsage(strategy, false);
        return { finalState: this.stateMachine.getState(), plan };
      }

      // 5. READY
      this.stateMachine.transitionTo(EvolutionState.READY);
      this.eventBus.publish(`StateTransitioned:${EvolutionState.READY}`);

      // 6. APPROVAL
      this.stateMachine.transitionTo(EvolutionState.APPROVAL);
      this.eventBus.publish(`StateTransitioned:${EvolutionState.APPROVAL}`);
      this.eventBus.publish('ApprovalRequested', { candidateId: candidate.candidateId });

      const appStart = Date.now();
      const approved = this.approvalService.approve(candidate, plan);
      this.metrics.recordApprovalLatency(Date.now() - appStart);

      this.eventBus.publish('ApprovalCompleted', { approved });
      this.ledgers.approval.append('RESULT', { approved });

      if (!approved) {
        this.stateMachine.transitionTo(EvolutionState.REJECTED);
        this.eventBus.publish(`StateTransitioned:${EvolutionState.REJECTED}`);
        this.eventBus.publish('EvolutionRejected', { reason: 'Approval Failed' });
        this.archive(candidate);
        this.metrics.recordStrategyUsage(strategy, false);
        return { finalState: this.stateMachine.getState(), plan };
      }

      // 7. APPROVED
      this.stateMachine.transitionTo(EvolutionState.APPROVED);
      this.eventBus.publish(`StateTransitioned:${EvolutionState.APPROVED}`);

      // 8. EVOLVING
      this.stateMachine.transitionTo(EvolutionState.EVOLVING);
      this.eventBus.publish(`StateTransitioned:${EvolutionState.EVOLVING}`);
      this.eventBus.publish('EvolutionStarted', { planId: plan.planId });

      // [Mock Execution of Evolution]
      this.ledgers.evolution.append('EXECUTE', { planId: plan.planId });

      // 9. EVOLVED
      this.stateMachine.transitionTo(EvolutionState.EVOLVED);
      this.eventBus.publish(`StateTransitioned:${EvolutionState.EVOLVED}`);
      this.eventBus.publish('EvolutionApplied', { candidateId: candidate.candidateId });
      this.eventBus.publish('EvolutionRecorded', { candidateId: candidate.candidateId });

      this.metrics.recordStrategyUsage(strategy, true);
      
      // 10. ARCHIVED
      this.archive(candidate);

      return { finalState: this.stateMachine.getState(), plan };
      
    } catch (error: any) {
      this.ledgers.audit.append('ERROR', { message: error.message });
      throw error;
    }
  }

  private archive(candidate: EvolutionCandidate) {
    this.stateMachine.transitionTo(EvolutionState.ARCHIVED);
    this.eventBus.publish(`StateTransitioned:${EvolutionState.ARCHIVED}`);
    this.eventBus.publish('EvolutionArchived', { candidateId: candidate.candidateId });
    this.ledgers.history.append('ARCHIVE', { candidateId: candidate.candidateId, state: this.stateMachine.getState() });
  }
}
