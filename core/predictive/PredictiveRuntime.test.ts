import { PredictiveRuntime } from "./PredictiveRuntime";
import { PredictionStateMachine } from "./PredictionStateMachine";
import { ContextAggregator } from "./ContextAggregator";
import { TrendAnalyzer } from "./TrendAnalyzer";
import { PredictionEngine } from "./PredictionEngine";
import { PredictionValidator } from "./PredictionValidator";
import { DecisionRecorder } from "./DecisionRecorder";
import { PredictionContext } from "./PredictionContext";
import { PredictionState } from "./PredictionState";
import { PredictionTarget } from "./PredictionTarget";
import { MockPredictionModel } from "./MockPredictionModel";
import { PredictionRegistry } from "./PredictionRegistry";
import { PredictivePolicy } from "./PredictivePolicy";
import { PredictionLedger } from "./PredictionLedger";
import { PredictionResult } from "./PredictionResult";

class MockAggregator implements ContextAggregator {
  async aggregate(context: PredictionContext) {
    if (context.dataQuality === 0) throw new Error("Corrupted History"); // For Scenario 4
    return []; 
  }
}

class MockAnalyzer implements TrendAnalyzer {
  analyze(data: any[]) { return {}; }
}

class MockRecorder extends DecisionRecorder {
  constructor() { super({} as PredictionLedger); }
  record() {}
}

const defaultPolicy: PredictivePolicy = {
  minConfidenceThreshold: 0.8,
  maxPredictionWindowMs: 5000,
  requiredDataQuality: 0.6,
  minSampleSize: 10
};

async function runTests() {
  console.log("Starting Predictive Runtime tests...");

  const baseContext: PredictionContext = {
    traceId: "TRACE-1", executionId: "EXEC-1", routingId: "ROUT-1", optimizationId: "OPT-1",
    historyWindow: 100, dataQuality: 0.9, sampleSize: 100, confidenceBaseline: 0.8,
    environmentVector: { eventDensity: 0.1, runtimeLoad: 0.2, cpuPressure: 0.1, memoryPressure: 0.1, executionLatency: 10, graphComplexity: 5, governancePressure: 0.1, optimizationDebt: 0.1, systemEntropy: 0.1, qualityScore: 0.9, trustScore: 0.9, runtimeHealth: 1.0 }
  };

  const registry = new PredictionRegistry();
  registry.register(new MockPredictionModel(PredictionTarget.LOAD_TREND));

  // Scenario 1: Normal Forecast
  let stateMachine = new PredictionStateMachine();
  let runtime = new PredictiveRuntime(
    stateMachine, new MockAggregator(), new MockAnalyzer(), new PredictionEngine(registry),
    new PredictionValidator(defaultPolicy), new MockRecorder()
  );
  await runtime.runPredictionCycle(baseContext, PredictionTarget.LOAD_TREND);
  if (stateMachine.getState() === PredictionState.COMPLETED) console.log("Scenario 1 (Normal Forecast): PASS");
  else console.error(`Scenario 1 (Normal Forecast): FAIL. State was ${stateMachine.getState()}`);

  // Scenario 2: High Risk Event Prediction
  stateMachine = new PredictionStateMachine();
  runtime = new PredictiveRuntime(
    stateMachine, new MockAggregator(), new MockAnalyzer(), new PredictionEngine(registry),
    new PredictionValidator(defaultPolicy), new MockRecorder()
  );
  await runtime.runPredictionCycle({ ...baseContext, environmentVector: { ...baseContext.environmentVector, eventDensity: 0.9 } }, PredictionTarget.LOAD_TREND);
  if (stateMachine.getState() === PredictionState.COMPLETED) console.log("Scenario 2 (High Risk Event): PASS");
  else console.error(`Scenario 2 (High Risk Event): FAIL. State was ${stateMachine.getState()}`);

  // Scenario 3: Low Confidence Rejection
  stateMachine = new PredictionStateMachine();
  runtime = new PredictiveRuntime(
    stateMachine, new MockAggregator(), new MockAnalyzer(), new PredictionEngine(registry),
    new PredictionValidator(defaultPolicy), new MockRecorder()
  );
  // Setting dataQuality low so MockPredictionModel yields low confidence, and Validator rejects it
  await runtime.runPredictionCycle({ ...baseContext, dataQuality: 0.4 }, PredictionTarget.LOAD_TREND);
  if (stateMachine.getState() === PredictionState.ARCHIVED) console.log("Scenario 3 (Low Confidence): PASS");
  else console.error(`Scenario 3 (Low Confidence): FAIL. State was ${stateMachine.getState()}`);

  // Scenario 4: Corrupted History (Exception during aggregation)
  stateMachine = new PredictionStateMachine();
  runtime = new PredictiveRuntime(
    stateMachine, new MockAggregator(), new MockAnalyzer(), new PredictionEngine(registry),
    new PredictionValidator(defaultPolicy), new MockRecorder()
  );
  await runtime.runPredictionCycle({ ...baseContext, dataQuality: 0 }, PredictionTarget.LOAD_TREND);
  if (stateMachine.getState() === PredictionState.ARCHIVED) console.log("Scenario 4 (Corrupted History): PASS");
  else console.error(`Scenario 4 (Corrupted History): FAIL. State was ${stateMachine.getState()}`);
}

runTests().catch(console.error);
