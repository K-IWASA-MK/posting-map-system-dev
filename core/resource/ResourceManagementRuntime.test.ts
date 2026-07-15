import { ResourceManagementRuntime } from "./ResourceManagementRuntime";
import { ResourceStateMachine } from "./ResourceStateMachine";
import { AllocatorEngine } from "./AllocatorEngine";
import { SchedulingEngine } from "./SchedulingEngine";
import { ResourceValidator } from "./ResourceValidator";
import { MockCapacityMonitor } from "./MockCapacityMonitor";
import { ResourceRequirement } from "./ResourceRequirement";
import { AllocationStrategy } from "./AllocationStrategy";
import { ResourcePolicy } from "./ResourcePolicy";
import { QueuePriority } from "./QueuePriority";
import { ResourceQuota } from "./ResourceQuota";
import { ResourceState } from "./ResourceState";

async function runTests() {
  console.log("Starting Resource Management Runtime tests...");

  const requirement: ResourceRequirement = {
    requirementId: "REQ-1",
    traceId: "TRACE-1",
    estimatedCpuMs: 10,
    estimatedMemoryMb: 50,
    requiredTokens: 100,
    maxCostLimit: 10
  };

  const largeRequirement: ResourceRequirement = {
    requirementId: "REQ-2",
    traceId: "TRACE-2",
    estimatedCpuMs: 10,
    estimatedMemoryMb: 50,
    requiredTokens: 10000,
    maxCostLimit: 10
  };

  const quota: ResourceQuota = {
    runtimeQuota: 5000,
    agentQuota: 1000,
    sessionQuota: 500
  };

  const allocator = new AllocatorEngine();
  const scheduler = new SchedulingEngine();
  const validator = new ResourceValidator();

  // Scenario 1: Normal Allocation
  let stateMachine = new ResourceStateMachine();
  let monitor = new MockCapacityMonitor();
  let runtime = new ResourceManagementRuntime(stateMachine, monitor, allocator, scheduler, validator);
  await runtime.allocateResources(requirement, AllocationStrategy.BEST_FIT, ResourcePolicy.STRICT_LIMIT, QueuePriority.NORMAL, quota);
  if (stateMachine.getState() === ResourceState.COMPLETED) console.log("Scenario 1 (Normal Allocation): PASS");
  else console.error(`Scenario 1: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 2: Token Exhaustion Prevention
  stateMachine = new ResourceStateMachine();
  monitor = new MockCapacityMonitor(false, 20000);
  runtime = new ResourceManagementRuntime(stateMachine, monitor, allocator, scheduler, validator);
  await runtime.allocateResources(largeRequirement, AllocationStrategy.BEST_FIT, ResourcePolicy.STRICT_LIMIT, QueuePriority.NORMAL, quota);
  if (stateMachine.getState() === ResourceState.ARCHIVED) console.log("Scenario 2 (Token Exhaustion Prevention): PASS");
  else console.error(`Scenario 2: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 3: CPU Throttling Placeholder
  stateMachine = new ResourceStateMachine();
  monitor = new MockCapacityMonitor();
  runtime = new ResourceManagementRuntime(stateMachine, monitor, allocator, scheduler, validator);
  await runtime.allocateResources(requirement, AllocationStrategy.PREEMPTIVE, ResourcePolicy.COST_SAVING, QueuePriority.BACKGROUND, quota);
  if (stateMachine.getState() === ResourceState.COMPLETED) console.log("Scenario 3 (CPU Throttling): PASS");
  else console.error(`Scenario 3: FAIL. State was ${stateMachine.getState()}`);

  // Scenario 4: Capacity Monitor Error
  stateMachine = new ResourceStateMachine();
  monitor = new MockCapacityMonitor(true);
  runtime = new ResourceManagementRuntime(stateMachine, monitor, allocator, scheduler, validator);
  await runtime.allocateResources(requirement, AllocationStrategy.BEST_FIT, ResourcePolicy.STRICT_LIMIT, QueuePriority.NORMAL, quota);
  if (stateMachine.getState() === ResourceState.ARCHIVED) console.log("Scenario 4 (Capacity Monitor Error): PASS");
  else console.error(`Scenario 4: FAIL. State was ${stateMachine.getState()}`);
}

runTests().catch(console.error);
