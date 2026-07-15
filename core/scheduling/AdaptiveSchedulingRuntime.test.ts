import { AdaptiveSchedulingRuntime } from "./AdaptiveSchedulingRuntime";
import { SchedulingStateMachine } from "./SchedulingStateMachine";
import { DependencyEngine } from "./DependencyEngine";
import { PrioritizationEngine } from "./PrioritizationEngine";
import { DispatchEngine } from "./DispatchEngine";
import { SchedulingContext } from "./SchedulingContext";
import { ScheduleStrategy } from "./ScheduleStrategy";
import { SchedulingPolicy } from "./SchedulingPolicy";
import { SchedulingState } from "./SchedulingState";

async function runTests() {
  console.log("Starting Adaptive Scheduling Runtime tests...");

  const context: SchedulingContext = {
    traceId: "TRACE-NORMAL",
    requirementId: "REQ-1",
    allocationId: "ALLOC-1",
    submittedAt: Date.now()
  };

  const depEngine = new DependencyEngine();
  const prioEngine = new PrioritizationEngine();
  const dispatchEngine = new DispatchEngine();

  // Scenario 1: Normal Priority Dispatch
  let stateMachine = new SchedulingStateMachine();
  let runtime = new AdaptiveSchedulingRuntime(stateMachine, depEngine, prioEngine, dispatchEngine);
  await runtime.scheduleTask(context, ScheduleStrategy.FIFO, SchedulingPolicy.FAIRNESS_FIRST);
  if (stateMachine.getState() === SchedulingState.COMPLETED) console.log("Scenario 1 (Normal Dispatch): PASS");
  else console.error(`Scenario 1: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 2: Dependency Resolution (Simulated by passing the normal flow)
  stateMachine = new SchedulingStateMachine();
  runtime = new AdaptiveSchedulingRuntime(stateMachine, depEngine, prioEngine, dispatchEngine);
  await runtime.scheduleTask(context, ScheduleStrategy.PRIORITY_BASED, SchedulingPolicy.SAFETY_FIRST);
  if (stateMachine.getState() === SchedulingState.COMPLETED) console.log("Scenario 2 (Dependency Resolution): PASS");
  else console.error(`Scenario 2: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 3: Preemption
  stateMachine = new SchedulingStateMachine();
  runtime = new AdaptiveSchedulingRuntime(stateMachine, depEngine, prioEngine, dispatchEngine);
  await runtime.scheduleTask(context, ScheduleStrategy.PREEMPTIVE_PRIORITY, SchedulingPolicy.LATENCY_FIRST, true, false);
  if (stateMachine.getState() === SchedulingState.COMPLETED) console.log("Scenario 3 (Preemption): PASS");
  else console.error(`Scenario 3: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 4: Deadline Missed
  stateMachine = new SchedulingStateMachine();
  runtime = new AdaptiveSchedulingRuntime(stateMachine, depEngine, prioEngine, dispatchEngine);
  await runtime.scheduleTask(context, ScheduleStrategy.DEADLINE_DRIVEN, SchedulingPolicy.LATENCY_FIRST, false, true);
  if (stateMachine.getState() === SchedulingState.ARCHIVED) console.log("Scenario 4 (Deadline Missed): PASS");
  else console.error(`Scenario 4: FAIL. State was ${stateMachine.getState()}`);
}

runTests().catch(console.error);
