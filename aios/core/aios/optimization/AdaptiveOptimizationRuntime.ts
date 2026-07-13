import { OptimizationStateMachine } from "./OptimizationStateMachine";
import { EnvironmentAnalyzer } from "./EnvironmentAnalyzer";
import { StrategySelector } from "./StrategySelector";
import { OptimizationEvaluator } from "./OptimizationEvaluator";
import { SimulationEngine } from "./SimulationEngine";
import { DecisionRecorder } from "./DecisionRecorder";
import { OptimizationState } from "./OptimizationState";
import { OptimizationStrategy } from "./OptimizationStrategy";
import { DecisionRecord } from "./DecisionRecord";
import { createAuditTrace } from "./AuditTag";

export class AdaptiveOptimizationRuntime {
  constructor(
    private stateMachine: OptimizationStateMachine,
    private analyzer: EnvironmentAnalyzer,
    private selector: StrategySelector,
    private evaluator: OptimizationEvaluator,
    private simulator: SimulationEngine,
    private recorder: DecisionRecorder
  ) {}

  public async runCycle(): Promise<void> {
    try {
      this.stateMachine.transition(OptimizationState.SENSING);
      
      this.stateMachine.transition(OptimizationState.ANALYZING);
      const vector = this.analyzer.analyze();
      
      this.stateMachine.transition(OptimizationState.EVALUATING);
      const strategy = this.selector.select(vector);
      
      if (strategy === OptimizationStrategy.NO_ACTION) {
        this.stateMachine.transition(OptimizationState.READY);
        this.stateMachine.transition(OptimizationState.COMPLETED);
        return;
      }
      
      const isSafe = this.evaluator.evaluate(strategy, vector);
      if (!isSafe) {
        throw new Error("Strategy evaluation failed safety checks");
      }
      
      this.stateMachine.transition(OptimizationState.SIMULATING);
      const simulationResult = await this.simulator.simulate(strategy, vector);
      
      this.stateMachine.transition(OptimizationState.DECIDING);
      
      const decision: DecisionRecord = {
        id: `DEC-${Date.now()}`,
        strategy,
        simulationResult,
        executedAt: Date.now(),
        status: simulationResult.success ? "APPROVED" : "REJECTED",
        reason: `Simulation completed with score ${simulationResult.score}`
      };
      
      this.recorder.record(decision);
      
      if (!simulationResult.success) {
        throw new Error("Simulation failed");
      }
      
      this.stateMachine.transition(OptimizationState.READY);
      this.stateMachine.transition(OptimizationState.COMPLETED);
      
    } catch (error) {
      if (this.stateMachine.getState() !== OptimizationState.FAILED && this.stateMachine.getState() !== OptimizationState.ARCHIVED) {
        this.stateMachine.transition(OptimizationState.FAILED);
        this.stateMachine.transition(OptimizationState.ARCHIVED);
      }
    }
  }
}
