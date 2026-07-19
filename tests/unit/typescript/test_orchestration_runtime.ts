import { OrchestrationRuntime } from '../../../sdk/core/orchestration/OrchestrationRuntime';
import { AutoScalingEngine } from '../../../sdk/core/orchestration/scaling/AutoScalingEngine';
import { AIOSEventBus } from '../../../sdk/core/event/AIOSEventBus';
import { RuntimeService } from '../../../sdk/core/runtime/service/RuntimeService';
import { RuntimeCapability } from '../../../sdk/core/runtime/RuntimeCapability';
import { RuntimeState } from '../../../sdk/core/runtime/RuntimeState';
import { SchedulingPolicy, ScalingDecisionReason, RecoveryState, PlacementPolicy, ResourceAllocation } from '../../../sdk/core/orchestration/models/OrchestrationModels';
import { LauncherExecutionRuntime } from '../../../core/launcher-runtime/LauncherExecutionRuntime';
import { LauncherResult } from '../../../core/launcher/LauncherResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Running Orchestration Runtime & Auto-Scaling Engine Foundation Tests...\n');

  const eventBus = new AIOSEventBus();
  const orchestrationRuntime = new OrchestrationRuntime(eventBus);
  const autoScalingEngine = new AutoScalingEngine(eventBus, orchestrationRuntime.getRegistry());

  const eventLog: string[] = [];
  eventBus.subscribe('*', async (event) => {
    eventLog.push(event.eventType);
  });

  // ==========================================
  // 1. Plan Generation & Placement Strategy
  // ==========================================
  console.log('   Testing Plan Generation and Placement Resolution...');
  const appPlan = await orchestrationRuntime.planOrchestration('APP-123', 'WF-456');
  
  assert(appPlan.applicationId === 'APP-123', 'Application ID must match');
  assert(appPlan.status === 'ACTIVE', 'Plan status should be active after resolution');
  assert(appPlan.resourceAllocation.cpu === 2, 'Default CPU resource allocated');
  
  // Placement Resolver checks (SPREAD strategy by default)
  assert(appPlan.resourceAllocation.placement.startsWith('node-spread-zone-'), 'Placement resolved to spread nodes');

  const resolver = orchestrationRuntime.getPlacementResolver();
  const binpackPolicy: PlacementPolicy = { policyId: 'P1', strategy: 'BINPACK' };
  const mockAlloc: ResourceAllocation = { allocationId: 'A1', cpu: 1, memory: 512, gpu: 0, storage: 5, network: 10, placement: 'pending' };
  const binpackPlacement = resolver.resolvePlacement(binpackPolicy, mockAlloc);
  assert(binpackPlacement === 'node-binpack-consolidated-1', 'Binpack strategy placement resolution');

  const affinityPolicy: PlacementPolicy = { policyId: 'P2', strategy: 'AFFINITY', affinity: ['node-specific-zone-A'] };
  const affinityPlacement = resolver.resolvePlacement(affinityPolicy, mockAlloc);
  assert(affinityPlacement === 'node-specific-zone-A', 'Affinity strategy placement resolution');

  const antiaffinityPolicy: PlacementPolicy = { policyId: 'P3', strategy: 'ANTI_AFFINITY' };
  const antiaffinityPlacement = resolver.resolvePlacement(antiaffinityPolicy, mockAlloc);
  assert(antiaffinityPlacement === 'node-antiaffinity-isolated', 'Anti-Affinity strategy placement resolution');

  console.log('   ✓ Plan Generation and Placement Resolution PASSED');

  // ==========================================
  // 2. Queue Prioritization & Scheduling
  // ==========================================
  console.log('   Testing Queue Prioritization and Scheduling...');
  const itemLow = await orchestrationRuntime.enqueueExecution('WF-LOW', 'APP-123', 'LOW');
  const itemCritical = await orchestrationRuntime.enqueueExecution('WF-CRIT', 'APP-123', 'CRITICAL');
  const itemHigh = await orchestrationRuntime.enqueueExecution('WF-HIGH', 'APP-123', 'HIGH');

  const dispatcher = orchestrationRuntime.getDispatcher();
  const items = orchestrationRuntime.getRegistry().listQueue();
  
  // Sort using SchedulingPolicy.PRIORITY
  const sortedPriority = dispatcher.sortQueue(items, SchedulingPolicy.PRIORITY);
  assert(sortedPriority[0].queueId === itemCritical.queueId, 'Highest priority item must be first');
  assert(sortedPriority[1].queueId === itemHigh.queueId, 'High priority item must be second');
  assert(sortedPriority[2].queueId === itemLow.queueId, 'Low priority item must be last');

  // Sort using SchedulingPolicy.FIFO
  const sortedFifo = dispatcher.sortQueue(items, SchedulingPolicy.FIFO);
  assert(sortedFifo[0].queueId === itemLow.queueId, 'First enqueued item must be first in FIFO');

  // Dispatching item
  await orchestrationRuntime.dispatchExecution(itemCritical.queueId);
  const updatedItem = orchestrationRuntime.getRegistry().getQueueItem(itemCritical.queueId);
  assert(updatedItem?.status === 'RUNNING', 'Dispatched queue item status should be RUNNING');
  assert(eventLog.includes('WorkflowDispatched'), 'WorkflowDispatched event should be published');

  console.log('   ✓ Queue Prioritization and Scheduling PASSED');

  // ==========================================
  // 3. Auto-Scaling Engine Thresholds
  // ==========================================
  console.log('   Testing Auto-Scaling Engine Thresholds...');
  
  const testPolicy = appPlan.scalingPolicy;
  
  // Test NO_OP (normal metrics)
  autoScalingEngine.getResourceMonitor().setMetrics({ cpuUsage: 40, memoryUsage: 45, gpuUsage: 0 });
  let decision = await autoScalingEngine.evaluatePolicy(testPolicy, 2);
  assert(decision.action === 'NO_OP', 'No scaling should occur');

  // Test SCALE_OUT on CPU usage
  autoScalingEngine.getResourceMonitor().setMetrics({ cpuUsage: 90, memoryUsage: 45, gpuUsage: 0 });
  decision = await autoScalingEngine.evaluatePolicy(testPolicy, 2);
  assert(decision.action === 'SCALE_OUT', 'Scale out on CPU');
  assert(decision.replicasDelta === 1, 'Scale out delta should be 1');
  assert(decision.reason === ScalingDecisionReason.CPU_THRESHOLD, 'Scaling reason CPU_THRESHOLD expected');

  // Test SCALE_OUT on GPU usage
  autoScalingEngine.getResourceMonitor().setMetrics({ cpuUsage: 30, memoryUsage: 45, gpuUsage: 90 });
  decision = await autoScalingEngine.evaluatePolicy(testPolicy, 3);
  assert(decision.action === 'SCALE_OUT', 'Scale out on GPU');
  assert(decision.reason === ScalingDecisionReason.GPU_THRESHOLD, 'Scaling reason GPU_THRESHOLD expected');

  // Test SCALE_OUT on Queue Depth
  autoScalingEngine.getResourceMonitor().setMetrics({ cpuUsage: 30, memoryUsage: 45, gpuUsage: 0 });
  // Add multiple pending queue items
  for (let i = 0; i < 15; i++) {
    await orchestrationRuntime.enqueueExecution(`WF-SCALE-${i}`, 'APP-123', 'MEDIUM');
  }
  decision = await autoScalingEngine.evaluatePolicy(testPolicy, 4);
  assert(decision.action === 'SCALE_OUT', 'Scale out on Queue Depth');
  assert(decision.reason === ScalingDecisionReason.QUEUE_DEPTH, 'Scaling reason QUEUE_DEPTH expected');

  // Test SCALE_IN (low cpu usage, empty queue)
  // Flush queue
  for (const qItem of orchestrationRuntime.getRegistry().listQueue()) {
    qItem.status = 'COMPLETED';
  }
  autoScalingEngine.getResourceMonitor().setMetrics({ cpuUsage: 20, memoryUsage: 30, gpuUsage: 0 });
  decision = await autoScalingEngine.evaluatePolicy(testPolicy, 5);
  assert(decision.action === 'SCALE_IN', 'Scale in condition triggered');
  assert(decision.replicasDelta === -1, 'Scale in delta should be -1');

  console.log('   ✓ Auto-Scaling Engine Thresholds PASSED');

  // ==========================================
  // 4. Self-Healing Recovery state transitions
  // ==========================================
  console.log('   Testing Recovery State Transitions...');
  await orchestrationRuntime.triggerRecovery('WF-FAILED-001', 'Node disconnected');
  assert(eventLog.includes('RecoveryPlanned'), 'RecoveryPlanned event must be published');
  assert(eventLog.includes('RecoveryExecuted'), 'RecoveryExecuted event must be published');

  console.log('   ✓ Recovery State Transitions PASSED');

  // ==========================================
  // 5. Capability Registry & Discovery
  // ==========================================
  console.log('   Testing Capability Registration and Discovery...');
  const runtimeService = new RuntimeService(eventBus);
  
  // Register runtime
  await runtimeService.register(orchestrationRuntime, 'orchestration');
  
  // Register Auto-Scaling Engine
  await runtimeService.register(autoScalingEngine, 'auto_scaling');

  const resolved = runtimeService.resolve('aios.orchestration') as OrchestrationRuntime;
  assert(resolved.descriptor.capabilities.includes(RuntimeCapability.ORCHESTRATION as any), 'Capabilities must match');
  assert(resolved.descriptor.capabilities.includes(RuntimeCapability.RESOURCE_MANAGEMENT as any), 'Capabilities must match');
  assert(resolved.descriptor.capabilities.includes(RuntimeCapability.SCHEDULING as any), 'Capabilities must match');
  assert(resolved.descriptor.capabilities.includes(RuntimeCapability.RECOVERY as any), 'Capabilities must match');

  const resolvedScaling = runtimeService.resolve('aios.auto-scaling') as AutoScalingEngine;
  assert(resolvedScaling.descriptor.capabilities.includes(RuntimeCapability.AUTO_SCALING as any), 'Capabilities must match');

  // Discovery checks
  const discovered = runtimeService.discovery.findByCapability(RuntimeCapability.ORCHESTRATION as any);
  assert(discovered.length === 1 && discovered[0].runtimeId === 'aios.orchestration', 'Should discover Orchestration capability');

  const discoveredScaling = runtimeService.discovery.findByCapability(RuntimeCapability.AUTO_SCALING as any);
  assert(discoveredScaling.length === 1 && discoveredScaling[0].runtimeId === 'aios.auto-scaling', 'Should discover AutoScaling capability');

  console.log('   ✓ Capability Registration and Discovery PASSED');

  // ==========================================
  // 6. Orchestration Before Execution Check
  // ==========================================
  console.log('   Testing Orchestration Before Execution guard check...');
  const launcherRuntime = new LauncherExecutionRuntime();
  const mockResult: LauncherResult = {
    success: true,
    projectId: 'test-proj',
    mode: 'development',
    decision: 'allow',
    reasons: [],
    errorCodes: [],
    warnings: [],
    bootTimestamp: Date.now()
  };

  // Test checkQueue success with queueId
  const procWithQueue = await launcherRuntime.execute(mockResult, {
    args: ['-e', 'console.log("guard passed")'],
    checkQueue: true,
    queueId: 'Q-ITEM-001'
  });
  assert(procWithQueue !== undefined, 'Should succeed executing allowed process with queueId');

  // Test checkQueue failure without queueId
  let threw = false;
  try {
    await launcherRuntime.execute(mockResult, {
      args: ['-e', 'console.log("guard should fail")'],
      checkQueue: true
    });
  } catch (e: any) {
    threw = true;
    assert(e.message.includes('Orchestration Violation'), 'Error message should match expectation');
  }
  assert(threw, 'Should throw an error if enqueued check fails');

  console.log('   ✓ Orchestration Before Execution guard check PASSED');

  console.log('\n==========================================');
  console.log('🎉 ALL ORCHESTRATION PLATFORM TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch((err) => {
  console.error('❌ Tests failed with error:', err);
  process.exit(1);
});
