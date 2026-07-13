import { PredictionStateMachine } from "./PredictionStateMachine";
import { ContextAggregator } from "./ContextAggregator";
import { TrendAnalyzer } from "./TrendAnalyzer";
import { PredictionEngine } from "./PredictionEngine";
import { PredictionValidator } from "./PredictionValidator";
import { DecisionRecorder } from "./DecisionRecorder";
import { PredictionContext } from "./PredictionContext";
import { PredictionState } from "./PredictionState";
import { PredictionTarget } from "./PredictionTarget";
import { PredictionResultRecord } from "./PredictionResultRecord";

export class PredictiveRuntime {
  constructor(
    private stateMachine: PredictionStateMachine,
    private aggregator: ContextAggregator,
    private analyzer: TrendAnalyzer,
    private engine: PredictionEngine,
    private validator: PredictionValidator,
    private recorder: DecisionRecorder
  ) {}

  public async runPredictionCycle(context: PredictionContext, target: PredictionTarget): Promise<void> {
    try {
      this.stateMachine.transition(PredictionState.COLLECTING_HISTORY);
      // History collection simulated
      
      this.stateMachine.transition(PredictionState.AGGREGATING_HISTORY);
      const history = await this.aggregator.aggregate(context);
      
      this.stateMachine.transition(PredictionState.ANALYZING_TRENDS);
      const trends = this.analyzer.analyze(history);
      
      this.stateMachine.transition(PredictionState.GENERATING_PREDICTIONS);
      const results = await this.engine.generate(context, history, target);
      
      this.stateMachine.transition(PredictionState.VALIDATING_PREDICTIONS);
      
      let allValid = true;
      for (const result of results) {
        const isValid = this.validator.validate(result, context);
        if (!isValid) allValid = false;
        
        const record: PredictionResultRecord = {
          id: `PRED-${Date.now()}`,
          traceId: context.traceId,
          result,
          isAccepted: isValid,
          reason: isValid ? "Confidence above threshold" : "Low confidence or invalid context",
          executedAt: Date.now()
        };
        this.recorder.record(record);
      }

      if (!allValid || results.length === 0) {
        // If predictions are rejected or none generated
        this.stateMachine.transition(PredictionState.ARCHIVED);
        return;
      }

      this.stateMachine.transition(PredictionState.READY);
      
      this.stateMachine.transition(PredictionState.COMPLETED);
      
    } catch (error) {
      if (this.stateMachine.getState() !== PredictionState.FAILED && this.stateMachine.getState() !== PredictionState.ARCHIVED) {
        this.stateMachine.transition(PredictionState.FAILED);
        this.stateMachine.transition(PredictionState.ARCHIVED);
      }
    }
  }
}
