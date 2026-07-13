import { AdaptiveOptimizationRuntime } from "./AdaptiveOptimizationRuntime";
import { OptimizationStateMachine } from "./OptimizationStateMachine";
import { EnvironmentAnalyzer } from "./EnvironmentAnalyzer";
import { StrategySelector } from "./StrategySelector";
import { OptimizationEvaluator } from "./OptimizationEvaluator";
import { SimulationEngine } from "./SimulationEngine";
import { DecisionRecorder } from "./DecisionRecorder";
import { OptimizationRegistry } from "./OptimizationRegistry";
import { MockOptimizationProvider } from "./MockOptimizationProvider";
import { EnvironmentVector } from "./EnvironmentVector";
import { OptimizationState } from "./OptimizationState";
import { OptimizationStrategy } from "./OptimizationStrategy";
import { SimulationResult } from "./SimulationResult";
import { AdaptiveOptimizationPolicy } from "./AdaptiveOptimizationPolicy";

// Mock Implementations for testing
class MockAnalyzer implements EnvironmentAnalyzer {
  constructor(private vector: EnvironmentVector) {}
  analyze(): EnvironmentVector { return this.vector; }
}

class MockEvaluator extends OptimizationEvaluator {
  constructor() { super({} as AdaptiveOptimizationPolicy); }
  evaluate(strategy: OptimizationStrategy, vector: EnvironmentVector): boolean {
    return strategy !== OptimizationStrategy.ISOLATE_MODULES; // Fails ISOLATE_MODULES
  }
}

class MockSimulator implements SimulationEngine {
  async simulate(strategy: OptimizationStrategy, vector: EnvironmentVector): Promise<SimulationResult> {
    const success = strategy !== OptimizationStrategy.REWIRE_GRAPH;
    return {
      score: success ? 95 : 40,
      risk: success ? "LOW" : "CRITICAL",
      benefit: success ? 100 : -50,
      recommendation: strategy,
      traceId: "TRACE-TEST",
      success
    };
  }
}

class MockRecorder extends DecisionRecorder {
  constructor() { super({} as any); }
  record() {}
}

async function runTests() {
  console.log("Starting tests...");

  // Scenario 1: Normal Environment -> NO_ACTION -> READY -> COMPLETED
  const normalVector: EnvironmentVector = {
    eventDensity: 0.1, runtimeLoad: 0.2, cpuPressure: 0.1, memoryPressure: 0.1,
    executionLatency: 10, graphComplexity: 5, governancePressure: 0.1,
    optimizationDebt: 0.1, systemEntropy: 0.1, qualityScore: 0.9, trustScore: 0.9, runtimeHealth: 1.0
  };
  
  let stateMachine = new OptimizationStateMachine();
  let registry = new OptimizationRegistry();
  registry.register(new MockOptimizationProvider());
  
  let runtime = new AdaptiveOptimizationRuntime(
    stateMachine,
    new MockAnalyzer(normalVector),
    new StrategySelector(registry),
    new MockEvaluator(),
    new MockSimulator(),
    new MockRecorder()
  );

  await runtime.runCycle();
  if (stateMachine.getState() === OptimizationState.COMPLETED) {
    console.log("Scenario 1 (Normal): PASS");
  } else {
    console.error(`Scenario 1 (Normal): FAIL. State was ${stateMachine.getState()}`);
  }

  // Scenario 2: High Load -> Strategy Selected -> Simulation Success -> READY -> COMPLETED
  const highLoadVector: EnvironmentVector = {
    ...normalVector, runtimeLoad: 0.9
  };
  
  stateMachine = new OptimizationStateMachine();
  runtime = new AdaptiveOptimizationRuntime(
    stateMachine,
    new MockAnalyzer(highLoadVector),
    new StrategySelector(registry),
    new MockEvaluator(),
    new MockSimulator(),
    new MockRecorder()
  );

  await runtime.runCycle();
  if (stateMachine.getState() === OptimizationState.COMPLETED) {
    console.log("Scenario 2 (High Load): PASS");
  } else {
    console.error(`Scenario 2 (High Load): FAIL. State was ${stateMachine.getState()}`);
  }

  // Scenario 3: Unsafe Strategy -> Simulation Failed -> FAILED -> ARCHIVED
  const unsafeVector: EnvironmentVector = {
    ...normalVector, systemEntropy: 0.95
  };
  
  stateMachine = new OptimizationStateMachine();
  runtime = new AdaptiveOptimizationRuntime(
    stateMachine,
    new MockAnalyzer(unsafeVector),
    new StrategySelector(registry),
    new MockEvaluator(),
    new MockSimulator(),
    new MockRecorder()
  );

  await runtime.runCycle();
  if (stateMachine.getState() === OptimizationState.ARCHIVED) {
    console.log("Scenario 3 (Unsafe): PASS");
  } else {
    console.error(`Scenario 3 (Unsafe): FAIL. State was ${stateMachine.getState()}`);
  }
}

runTests().catch(console.error);
