import { CoordinationStateMachine } from "./CoordinationStateMachine";
import { ContextAggregator } from "./ContextAggregator";
import { RuntimeQueryEngine } from "./RuntimeQueryEngine";
import { ConsensusEngine } from "./ConsensusEngine";
import { CoordinationEngine } from "./CoordinationEngine";
import { DecisionValidator } from "./DecisionValidator";
import { CoordinationContext } from "./CoordinationContext";
import { CoordinationState } from "./CoordinationState";
import { CoordinationPolicy } from "./CoordinationPolicy";
import { DelegationPlan } from "./DelegationPlan";

export class AdaptiveCoordinationRuntime {
  constructor(
    private stateMachine: CoordinationStateMachine,
    private aggregator: ContextAggregator,
    private queryEngine: RuntimeQueryEngine,
    private consensusEngine: ConsensusEngine,
    private coordinationEngine: CoordinationEngine,
    private validator: DecisionValidator
  ) {}

  public async runCoordinationCycle(traceId: string, policy: CoordinationPolicy): Promise<void> {
    try {
      this.stateMachine.transition(CoordinationState.COLLECTING_CONTEXT);
      const context = await this.aggregator.aggregate(traceId);
      
      this.stateMachine.transition(CoordinationState.QUERYING_RUNTIMES);
      const responses = await this.queryEngine.queryAll(traceId);
      
      this.stateMachine.transition(CoordinationState.CONSENSUS);
      const consensus = this.consensusEngine.establishConsensus(responses, policy);
      
      this.stateMachine.transition(CoordinationState.GENERATING_PLAN);
      const plan = this.coordinationEngine.generatePlan(context, consensus);
      
      this.stateMachine.transition(CoordinationState.VALIDATING_PLAN);
      // Validator for plan could be added, assuming valid for now
      
      this.stateMachine.transition(CoordinationState.GENERATING_DECISION);
      const decision = this.coordinationEngine.generateDecision(context, plan, consensus);
      
      this.stateMachine.transition(CoordinationState.VALIDATING_DECISION);
      const isValid = this.validator.validate(decision);
      
      if (!isValid) {
        this.stateMachine.transition(CoordinationState.ARCHIVED);
        return;
      }
      
      this.stateMachine.transition(CoordinationState.GENERATING_DELEGATION);
      const delegation: DelegationPlan = {
        executionMode: "ASYNC",
        priority: 10,
        timeoutMs: 5000,
        rollbackRequired: true,
        validationRequired: true
      };
      
      this.stateMachine.transition(CoordinationState.DELEGATING_EXECUTION);
      // Execution delegator would trigger execution layer
      
      this.stateMachine.transition(CoordinationState.COMPLETED);
      
    } catch (error) {
      if (this.stateMachine.getState() !== CoordinationState.FAILED && this.stateMachine.getState() !== CoordinationState.ARCHIVED) {
        this.stateMachine.transition(CoordinationState.FAILED);
        this.stateMachine.transition(CoordinationState.ARCHIVED);
      }
    }
  }
}
