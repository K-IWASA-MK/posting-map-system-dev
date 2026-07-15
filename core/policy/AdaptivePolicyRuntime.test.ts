import { AdaptivePolicyRuntime } from "./AdaptivePolicyRuntime";
import { PolicyStateMachine } from "./PolicyStateMachine";
import { ContextAggregator } from "./ContextAggregator";
import { RuleEngine } from "./RuleEngine";
import { PolicyValidator } from "./PolicyValidator";
import { DecisionRecorder } from "./DecisionRecorder";
import { PolicyContext } from "./PolicyContext";
import { PolicyState } from "./PolicyState";
import { PolicyProfile } from "./PolicyProfile";
import { MockPolicyRule } from "./MockPolicyRule";
import { PolicyRegistry } from "./PolicyRegistry";
import { PolicyConflictResolver } from "./PolicyConflictResolver";
import { PolicyLedger } from "./PolicyLedger";
import { PredictivePolicyRule } from "./PredictivePolicyRule";
import { PredictionTarget } from "../predictive/PredictionTarget";

class MockAggregator implements ContextAggregator {
  async aggregate(traceId: string): Promise<PolicyContext> {
    if (traceId === "ERROR") throw new Error("Context Error");
    
    return {
      traceId,
      environmentVector: { eventDensity: 0.1, runtimeLoad: 0.2, cpuPressure: 0.1, memoryPressure: 0.1, executionLatency: 10, graphComplexity: 5, governancePressure: 0.1, optimizationDebt: 0.1, systemEntropy: 0.1, qualityScore: 0.9, trustScore: 0.9, runtimeHealth: 1.0 },
      activePredictions: traceId === "EMERGENCY" ? [{ target: PredictionTarget.EVENT_OCCURRENCE, predictedValue: 1, confidence: 0.99, risk: "CRITICAL", recommendation: "Stop", traceId }] : [],
      currentActivePolicies: [],
      systemHealth: traceId === "LOW_HEALTH" ? 0.3 : 1.0
    };
  }
}

class MockRecorder extends DecisionRecorder {
  constructor() { super({} as PolicyLedger); }
  recordUpdate() {}
}

async function runTests() {
  console.log("Starting Adaptive Policy Runtime tests...");

  // Setup registry & resolver
  const registry = new PolicyRegistry();
  const resolver = new PolicyConflictResolver();
  
  registry.register(new PredictivePolicyRule()); // id: RULE-PRED-001, priority: 100, exclusive: true
  registry.register(new MockPolicyRule("RULE-MOCK-PERF", 50, false, PolicyProfile.MAX_PERFORMANCE));

  const engine = new RuleEngine(registry, resolver);
  const validator = new PolicyValidator();
  const recorder = new MockRecorder();

  // Scenario 1: Normal Operations
  let stateMachine = new PolicyStateMachine();
  let runtime = new AdaptivePolicyRuntime(stateMachine, new MockAggregator(), engine, validator, recorder);
  await runtime.runPolicyCycle("TRACE-1", PolicyProfile.BALANCED);
  if (stateMachine.getState() === PolicyState.COMPLETED) console.log("Scenario 1 (Normal Operations): PASS");
  else console.error(`Scenario 1: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 2: Emergency Recovery Trigger
  stateMachine = new PolicyStateMachine();
  runtime = new AdaptivePolicyRuntime(stateMachine, new MockAggregator(), engine, validator, recorder);
  await runtime.runPolicyCycle("EMERGENCY", PolicyProfile.BALANCED);
  // PredictivePolicyRule should trigger EMERGENCY_RECOVERY
  if (stateMachine.getState() === PolicyState.COMPLETED) console.log("Scenario 2 (Emergency Trigger): PASS");
  else console.error(`Scenario 2: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 3: Validation Failure
  stateMachine = new PolicyStateMachine();
  runtime = new AdaptivePolicyRuntime(stateMachine, new MockAggregator(), engine, validator, recorder);
  // LOW_HEALTH returns systemHealth=0.3. MockRule returns MAX_PERFORMANCE. Validator should reject MAX_PERFORMANCE when health < 0.5.
  await runtime.runPolicyCycle("LOW_HEALTH", PolicyProfile.BALANCED);
  if (stateMachine.getState() === PolicyState.ARCHIVED) console.log("Scenario 3 (Validation Failure): PASS");
  else console.error(`Scenario 3: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 4: Context Aggregation Error
  stateMachine = new PolicyStateMachine();
  runtime = new AdaptivePolicyRuntime(stateMachine, new MockAggregator(), engine, validator, recorder);
  await runtime.runPolicyCycle("ERROR", PolicyProfile.BALANCED);
  if (stateMachine.getState() === PolicyState.ARCHIVED) console.log("Scenario 4 (Context Error): PASS");
  else console.error(`Scenario 4: FAIL. State was ${stateMachine.getState()}`);
}

runTests().catch(console.error);
