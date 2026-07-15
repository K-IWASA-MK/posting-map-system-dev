import { ExecutionRuntime } from "./ExecutionRuntime";
import { ExecutionStateMachine } from "./ExecutionStateMachine";
import { TicketClaimEngine } from "./TicketClaimEngine";
import { ExecutionEngine } from "./ExecutionEngine";
import { RollbackEngine } from "./RollbackEngine";
import { ExecutionContext } from "./ExecutionContext";
import { ExecutionPlan } from "./ExecutionPlan";
import { ExecutionState } from "./ExecutionState";

async function runTests() {
  console.log("Starting Execution Runtime tests...");

  const context: ExecutionContext = {
    traceId: "TRACE-NORMAL",
    ticketId: "TICKET-1",
    policyContext: {},
    routingContext: {},
    resourceContext: {},
    schedulingContext: {}
  };

  const plan: ExecutionPlan = {
    planId: "PLAN-1",
    steps: [],
    totalTimeoutMs: 10000,
    requiresCheckpoint: true,
    rollbackSupported: true
  };

  const claimEngine = new TicketClaimEngine();
  const executionEngine = new ExecutionEngine();
  const rollbackEngine = new RollbackEngine();

  // Scenario 1: Normal Execution
  let stateMachine = new ExecutionStateMachine();
  let runtime = new ExecutionRuntime(stateMachine, claimEngine, executionEngine, rollbackEngine);
  await runtime.execute(context, plan);
  if (stateMachine.getState() === ExecutionState.COMPLETED) console.log("Scenario 1 (Normal Execution): PASS");
  else console.error(`Scenario 1: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 2: Double Claim Prevention
  stateMachine = new ExecutionStateMachine();
  runtime = new ExecutionRuntime(stateMachine, claimEngine, executionEngine, rollbackEngine);
  await runtime.execute(context, plan, true); // simulateDoubleClaim = true
  if (stateMachine.getState() === ExecutionState.ARCHIVED) console.log("Scenario 2 (Double Claim Prevention): PASS");
  else console.error(`Scenario 2: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 3: Execution Failure & Rollback
  const failContext = { ...context, ticketId: "TICKET-FAIL" };
  stateMachine = new ExecutionStateMachine();
  runtime = new ExecutionRuntime(stateMachine, claimEngine, executionEngine, rollbackEngine);
  await runtime.execute(failContext, plan, false, true); // simulateFailure = true
  if (stateMachine.getState() === ExecutionState.ARCHIVED) console.log("Scenario 3 (Execution Failure & Rollback): PASS");
  else console.error(`Scenario 3: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 4: Timeout Policy
  const timeoutContext = { ...context, ticketId: "TICKET-TIMEOUT" };
  stateMachine = new ExecutionStateMachine();
  runtime = new ExecutionRuntime(stateMachine, claimEngine, executionEngine, rollbackEngine);
  await runtime.execute(timeoutContext, plan, false, false, true); // simulateTimeout = true
  if (stateMachine.getState() === ExecutionState.ARCHIVED) console.log("Scenario 4 (Timeout Policy): PASS");
  else console.error(`Scenario 4: FAIL. State was ${stateMachine.getState()}`);
}

runTests().catch(console.error);
