import { AdaptiveCoordinationRuntime } from "./AdaptiveCoordinationRuntime";
import { CoordinationStateMachine } from "./CoordinationStateMachine";
import { ContextAggregator } from "./ContextAggregator";
import { CoordinationContext } from "./CoordinationContext";
import { MockRuntimeClient } from "./MockRuntimeClient";
import { ConsensusEngine } from "./ConsensusEngine";
import { CoordinationEngine } from "./CoordinationEngine";
import { DecisionValidator } from "./DecisionValidator";
import { CoordinationPolicy } from "./CoordinationPolicy";
import { CoordinationState } from "./CoordinationState";

class MockAggregator implements ContextAggregator {
  async aggregate(traceId: string): Promise<CoordinationContext> {
    return {
      traceId,
      environmentVector: {},
      optimizationState: "READY",
      routingState: "READY",
      predictiveState: "READY",
      policyState: "ACTIVE",
      timestamp: Date.now()
    };
  }
}

class RejectingValidator extends DecisionValidator {
  validate(decision: any): boolean {
    return false; // Force validation failure
  }
}

async function runTests() {
  console.log("Starting Adaptive Coordination Runtime tests...");

  const queryEngine = new MockRuntimeClient();
  const consensusEngine = new ConsensusEngine();
  const coordEngine = new CoordinationEngine();

  // Scenario 1: Routine Execution
  let stateMachine = new CoordinationStateMachine();
  let runtime = new AdaptiveCoordinationRuntime(stateMachine, new MockAggregator(), queryEngine, consensusEngine, coordEngine, new DecisionValidator());
  await runtime.runCoordinationCycle("TRACE-1", CoordinationPolicy.CONSENSUS);
  if (stateMachine.getState() === CoordinationState.COMPLETED) console.log("Scenario 1 (Routine Execution): PASS");
  else console.error(`Scenario 1: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 2: Risk Mitigation Override
  stateMachine = new CoordinationStateMachine();
  runtime = new AdaptiveCoordinationRuntime(stateMachine, new MockAggregator(), queryEngine, consensusEngine, coordEngine, new DecisionValidator());
  await runtime.runCoordinationCycle("RISK", CoordinationPolicy.EMERGENCY_OVERRIDE);
  if (stateMachine.getState() === CoordinationState.COMPLETED) console.log("Scenario 2 (Risk Mitigation): PASS");
  else console.error(`Scenario 2: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 3: Decision Validation Failure
  stateMachine = new CoordinationStateMachine();
  runtime = new AdaptiveCoordinationRuntime(stateMachine, new MockAggregator(), queryEngine, consensusEngine, coordEngine, new RejectingValidator());
  await runtime.runCoordinationCycle("TRACE-3", CoordinationPolicy.CONSENSUS);
  if (stateMachine.getState() === CoordinationState.ARCHIVED) console.log("Scenario 3 (Validation Failure): PASS");
  else console.error(`Scenario 3: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 4: Runtime Query Error
  stateMachine = new CoordinationStateMachine();
  runtime = new AdaptiveCoordinationRuntime(stateMachine, new MockAggregator(), queryEngine, consensusEngine, coordEngine, new DecisionValidator());
  await runtime.runCoordinationCycle("ERROR", CoordinationPolicy.CONSENSUS);
  if (stateMachine.getState() === CoordinationState.ARCHIVED) console.log("Scenario 4 (Query Error): PASS");
  else console.error(`Scenario 4: FAIL. State was ${stateMachine.getState()}`);
}

runTests().catch(console.error);
