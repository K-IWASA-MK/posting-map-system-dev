import { AdaptiveRoutingRuntime } from "./AdaptiveRoutingRuntime";
import { RoutingStateMachine } from "./RoutingStateMachine";
import { ContextAnalyzer } from "./ContextAnalyzer";
import { PathDeterminer } from "./PathDeterminer";
import { PathValidator } from "./PathValidator";
import { DecisionRecorder } from "./DecisionRecorder";
import { RoutingContext } from "./RoutingContext";
import { RoutingState } from "./RoutingState";
import { RoutingPath } from "./RoutingPath";
import { PolicyResolver } from "./PolicyResolver";
import { AdaptiveRoutingPolicy } from "./AdaptiveRoutingPolicy";
import { DecisionLedger } from "./RoutingLedger";

// Mock Implementations for testing
class MockAnalyzer implements ContextAnalyzer {
  analyze(context: RoutingContext): RoutingContext { return context; }
}

class MockResolver extends PolicyResolver {
  constructor() { super({} as AdaptiveRoutingPolicy); }
  resolve(context: RoutingContext): RoutingPath[] {
    if (context.trustScore > 0.9) return [RoutingPath.FAST_TRACK];
    if (context.governancePressure > 0.8) return [RoutingPath.STRICT_VALIDATION_PATH];
    if (context.environmentVector.runtimeLoad > 0.9) return [RoutingPath.THROTTLED_PATH];
    if (context.trustScore < 0.2) return [RoutingPath.BLOCKED];
    return [RoutingPath.STANDARD_PATH];
  }
}

class MockValidator extends PathValidator {
  constructor() { super({} as AdaptiveRoutingPolicy); }
  validate(path: RoutingPath, context: RoutingContext): boolean {
    return path !== RoutingPath.BLOCKED;
  }
}

class MockRecorder extends DecisionRecorder {
  constructor() { super({} as DecisionLedger); }
  record() {}
}

async function runTests() {
  console.log("Starting Routing tests...");

  const baseContext: RoutingContext = {
    requestId: "REQ-1", executionId: "EXEC-1", runtimeId: "RUN-1",
    trustScore: 0.5, governancePressure: 0.1, qualityScore: 0.8,
    requestedCapability: "DEFAULT", priority: 1, deadline: 1000, traceId: "TRACE-1",
    environmentVector: { eventDensity: 0.1, runtimeLoad: 0.2, cpuPressure: 0.1, memoryPressure: 0.1, executionLatency: 10, graphComplexity: 5, governancePressure: 0.1, optimizationDebt: 0.1, systemEntropy: 0.1, qualityScore: 0.9, trustScore: 0.9, runtimeHealth: 1.0 }
  };

  // Scenario 1: High Trust -> FAST_TRACK -> COMPLETED
  let stateMachine = new RoutingStateMachine();
  let runtime = new AdaptiveRoutingRuntime(
    stateMachine, new MockAnalyzer(), new PathDeterminer(new MockResolver()), new MockValidator(), new MockRecorder()
  );
  await runtime.route({ ...baseContext, trustScore: 0.95 });
  if (stateMachine.getState() === RoutingState.COMPLETED) {
    console.log("Scenario 1 (High Trust): PASS");
  } else {
    console.error(`Scenario 1 (High Trust): FAIL. State was ${stateMachine.getState()}`);
  }

  // Scenario 2: High Governance -> STRICT_VALIDATION_PATH -> COMPLETED
  stateMachine = new RoutingStateMachine();
  runtime = new AdaptiveRoutingRuntime(
    stateMachine, new MockAnalyzer(), new PathDeterminer(new MockResolver()), new MockValidator(), new MockRecorder()
  );
  await runtime.route({ ...baseContext, governancePressure: 0.9 });
  if (stateMachine.getState() === RoutingState.COMPLETED) {
    console.log("Scenario 2 (High Governance): PASS");
  } else {
    console.error(`Scenario 2 (High Governance): FAIL. State was ${stateMachine.getState()}`);
  }

  // Scenario 3: Extreme Load -> THROTTLED_PATH -> COMPLETED
  stateMachine = new RoutingStateMachine();
  runtime = new AdaptiveRoutingRuntime(
    stateMachine, new MockAnalyzer(), new PathDeterminer(new MockResolver()), new MockValidator(), new MockRecorder()
  );
  await runtime.route({ ...baseContext, environmentVector: { ...baseContext.environmentVector, runtimeLoad: 0.95 } });
  if (stateMachine.getState() === RoutingState.COMPLETED) {
    console.log("Scenario 3 (Extreme Load): PASS");
  } else {
    console.error(`Scenario 3 (Extreme Load): FAIL. State was ${stateMachine.getState()}`);
  }

  // Scenario 4: Unsafe Request -> BLOCKED -> ARCHIVED
  stateMachine = new RoutingStateMachine();
  runtime = new AdaptiveRoutingRuntime(
    stateMachine, new MockAnalyzer(), new PathDeterminer(new MockResolver()), new MockValidator(), new MockRecorder()
  );
  await runtime.route({ ...baseContext, trustScore: 0.1 });
  if (stateMachine.getState() === RoutingState.ARCHIVED) {
    console.log("Scenario 4 (Unsafe): PASS");
  } else {
    console.error(`Scenario 4 (Unsafe): FAIL. State was ${stateMachine.getState()}`);
  }
}

runTests().catch(console.error);
