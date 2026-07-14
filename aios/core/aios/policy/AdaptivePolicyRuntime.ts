import { PolicyStateMachine } from "./PolicyStateMachine";
import { ContextAggregator } from "./ContextAggregator";
import { RuleEngine } from "./RuleEngine";
import { PolicyValidator } from "./PolicyValidator";
import { DecisionRecorder } from "./DecisionRecorder";
import { PolicyContext } from "./PolicyContext";
import { PolicyState } from "./PolicyState";
import { PolicyProfile } from "./PolicyProfile";
import { PolicyUpdateRecord } from "./PolicyUpdateRecord";
import { PolicyVersion } from "./PolicyVersion";
import { PolicyScope } from "./PolicyScope";
import { AffectedRuntime } from "./AffectedRuntime";

export class AdaptivePolicyRuntime {
  constructor(
    private stateMachine: PolicyStateMachine,
    private aggregator: ContextAggregator,
    private engine: RuleEngine,
    private validator: PolicyValidator,
    private recorder: DecisionRecorder
  ) {}

  public async runPolicyCycle(traceId: string, currentProfile: PolicyProfile): Promise<void> {
    try {
      this.stateMachine.transition(PolicyState.COLLECTING_CONTEXT);
      const context = await this.aggregator.aggregate(traceId);
      
      this.stateMachine.transition(PolicyState.EVALUATING_RULES);
      // Rules evaluated inside RuleEngine but we can separate conflicts
      this.stateMachine.transition(PolicyState.RESOLVING_CONFLICTS);
      
      this.stateMachine.transition(PolicyState.GENERATING_POLICY);
      const recommendation = this.engine.evaluate(context);
      
      this.stateMachine.transition(PolicyState.VALIDATING_POLICY);
      const isValid = this.validator.validate(recommendation, context);
      
      if (!isValid) {
        this.stateMachine.transition(PolicyState.ARCHIVED);
        return;
      }
      
      this.stateMachine.transition(PolicyState.APPROVING_POLICY);
      // Mock approval
      
      this.stateMachine.transition(PolicyState.READY);
      
      this.stateMachine.transition(PolicyState.ACTIVATING_POLICY);
      const version: PolicyVersion = {
        policyId: `POL-${Date.now()}`,
        version: "v1.0",
        revision: 1,
        generatedFrom: "RuleEngine",
        approvedBy: "System",
        createdAt: Date.now()
      };
      
      const record: PolicyUpdateRecord = {
        id: `UPD-${Date.now()}`,
        traceId,
        version,
        diff: {
          beforeProfile: currentProfile,
          afterProfile: recommendation.recommendedProfile,
          reason: recommendation.reason,
          trigger: "Scheduled Evaluation",
          changedRules: [],
          impactSummary: "Adjusted profile to " + recommendation.recommendedProfile
        },
        scope: PolicyScope.GLOBAL,
        affectedRuntimes: [AffectedRuntime.OPTIMIZATION, AffectedRuntime.ROUTING, AffectedRuntime.PREDICTIVE],
        executedAt: Date.now()
      };
      
      this.recorder.recordUpdate(record);
      
      this.stateMachine.transition(PolicyState.COMPLETED);
      
    } catch (error) {
      if (this.stateMachine.getState() !== PolicyState.FAILED && this.stateMachine.getState() !== PolicyState.ARCHIVED) {
        this.stateMachine.transition(PolicyState.FAILED);
        this.stateMachine.transition(PolicyState.ARCHIVED);
      }
    }
  }
}
