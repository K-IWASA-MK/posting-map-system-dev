import { RoutingStateMachine } from "./RoutingStateMachine";
import { ContextAnalyzer } from "./ContextAnalyzer";
import { PathDeterminer } from "./PathDeterminer";
import { PathValidator } from "./PathValidator";
import { DecisionRecorder } from "./DecisionRecorder";
import { RoutingContext } from "./RoutingContext";
import { RoutingState } from "./RoutingState";
import { RoutingDecisionRecord } from "./RoutingDecisionRecord";
import { RoutingPath } from "./RoutingPath";

export class AdaptiveRoutingRuntime {
  constructor(
    private stateMachine: RoutingStateMachine,
    private analyzer: ContextAnalyzer,
    private determiner: PathDeterminer,
    private validator: PathValidator,
    private recorder: DecisionRecorder
  ) {}

  public async route(context: RoutingContext): Promise<void> {
    try {
      this.stateMachine.transition(RoutingState.SENSING);
      
      this.stateMachine.transition(RoutingState.EVALUATING_CONTEXT);
      const analyzedContext = this.analyzer.analyze(context);
      
      this.stateMachine.transition(RoutingState.DETERMINING_PATH);
      const path = this.determiner.determine(analyzedContext);
      
      this.stateMachine.transition(RoutingState.VALIDATING_PATH);
      const isValid = this.validator.validate(path, analyzedContext);
      
      const record: RoutingDecisionRecord = {
        id: `ROUTE-${Date.now()}`,
        traceId: context.traceId,
        selectedPath: path,
        isApproved: isValid,
        reason: isValid ? "Validation passed" : "Validation failed due to policy violation",
        executedAt: Date.now()
      };
      
      this.recorder.record(record);
      
      if (!isValid || path === RoutingPath.BLOCKED) {
        throw new Error("Path blocked or validation failed");
      }
      
      this.stateMachine.transition(RoutingState.READY);
      
      this.stateMachine.transition(RoutingState.ROUTING);
      // Actual routing logic (mocked in Foundation)
      
      this.stateMachine.transition(RoutingState.COMPLETED);
      
    } catch (error) {
      if (this.stateMachine.getState() !== RoutingState.FAILED && this.stateMachine.getState() !== RoutingState.ARCHIVED) {
        this.stateMachine.transition(RoutingState.FAILED);
        this.stateMachine.transition(RoutingState.ARCHIVED);
      }
    }
  }
}
