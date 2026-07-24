import assert from 'assert';
import {
  BrowserWorkerManager,
  BrowserTaskState,
  LockScope,
  RetryStrategy,
  BrowserTask,
  BrowserLockManager,
  BrowserTaskQueue,
  LockAcquisitionFailedException,
  WorkerQueueOverflowException,
  BrowserWorkerPolicy,
  TaskQueuedEvent,
  LockAcquiredEvent
} from '../../../sdk/browser/worker';
import { BrowserRuntime } from '../../../sdk/browser';

console.log("==================================================");
console.log("   BROWSER WORKER FOUNDATION UNIT TEST SUITE");
console.log("==================================================");

async function runBrowserWorkerFoundationTests() {
  // Test 1: Task Enqueue & State Transitions
  console.log("\n[Test 1] BrowserTaskState & Queue Verification...");
  BrowserWorkerManager.resetInstance();
  const mgr = BrowserWorkerManager.getInstance();

  const task1: BrowserTask = {
    id: 'task-traffic-001',
    agentId: 'TrafficAgent',
    priority: 'HIGH',
    scope: LockScope.PAGE,
    targetKey: 'page:/traffic-dashboard',
    action: async (rt) => { return { status: 'traffic_checked' }; },
    state: BrowserTaskState.QUEUED,
    enqueuedAt: Date.now(),
    agingScore: 0,
    retryPolicy: { strategy: RetryStrategy.NO_RETRY, maxAttempts: 1, backoffFactorMs: 0 },
    attemptsCount: 1
  };

  mgr.submitTask(task1);
  assert.strictEqual(mgr.getMetrics().queueLength, 1);
  console.log("   ✓ Test 1 Passed (Task enqueued into QUEUED state)");

  // Test 2: LockScope & Lock Contention
  console.log("\n[Test 2] LockScope Granularity & Contention Control...");
  const lockMgr = new BrowserLockManager();
  
  // Acquire PAGE lock for Agent A
  assert.strictEqual(lockMgr.acquireLock(LockScope.PAGE, 'page:/manager', 'AgentA'), true);
  assert.strictEqual(lockMgr.isLocked(LockScope.PAGE, 'page:/manager'), true);
  assert.strictEqual(lockMgr.getLockOwner(LockScope.PAGE, 'page:/manager'), 'AgentA');

  // Attempt to acquire same PAGE lock for Agent B -> Throws LockAcquisitionFailedException
  assert.throws(
    () => lockMgr.acquireLock(LockScope.PAGE, 'page:/manager', 'AgentB'),
    LockAcquisitionFailedException,
    'Locking same PAGE by another Agent must throw LockAcquisitionFailedException'
  );

  // Different PAGE lock by Agent B -> Allowed
  assert.strictEqual(lockMgr.acquireLock(LockScope.PAGE, 'page:/settings', 'AgentB'), true);

  // Release lock
  assert.strictEqual(lockMgr.releaseLock(LockScope.PAGE, 'page:/manager', 'AgentA'), true);
  assert.strictEqual(lockMgr.isLocked(LockScope.PAGE, 'page:/manager'), false);
  console.log("   ✓ Test 2 Passed (PAGE scope contention blocked Agent B, allowed distinct PAGE)");

  // Test 3: Fair Scheduler (Aging & Starvation Prevention)
  console.log("\n[Test 3] Fair Scheduling Algorithm (Aging)...");
  const queue = new BrowserTaskQueue();

  const highTask: BrowserTask = {
    id: 't-high', agentId: 'AgentA', priority: 'HIGH', scope: LockScope.GLOBAL_BROWSER, targetKey: 'global',
    action: async () => {}, state: BrowserTaskState.QUEUED, enqueuedAt: Date.now(), agingScore: 0,
    retryPolicy: { strategy: RetryStrategy.NO_RETRY, maxAttempts: 1, backoffFactorMs: 0 }, attemptsCount: 1
  };

  const bgTaskOld: BrowserTask = {
    id: 't-bg-old', agentId: 'AgentB', priority: 'BACKGROUND', scope: LockScope.GLOBAL_BROWSER, targetKey: 'global',
    action: async () => {}, state: BrowserTaskState.QUEUED, enqueuedAt: Date.now() - 30000, // 30 seconds ago
    agingScore: 0, retryPolicy: { strategy: RetryStrategy.NO_RETRY, maxAttempts: 1, backoffFactorMs: 0 }, attemptsCount: 1
  };

  queue.enqueue(highTask);
  queue.enqueue(bgTaskOld);

  // Background task enqueued 30s ago gets aging score 150 (30s * 5), outranking HIGH base priority (100)
  const topTask = queue.peek();
  assert.strictEqual(topTask?.id, 't-bg-old', 'Aging algorithm must promote old BACKGROUND task above new HIGH task');
  console.log("   ✓ Test 3 Passed (Starvation prevented via Aging score calculation)");

  // Test 4: Task Execution & Dispatching
  console.log("\n[Test 4] Worker Execution & BrowserRuntime Integration...");
  const runtime = BrowserRuntime.getInstance();
  await runtime.attach('ws://localhost:9222');

  const executed = await mgr.processNext(runtime);
  assert.strictEqual(executed, true);
  assert.strictEqual(task1.state, BrowserTaskState.COMPLETED);
  assert.deepStrictEqual(task1.result, { status: 'traffic_checked' });
  console.log("   ✓ Test 4 Passed (Task processed via BrowserRuntime into COMPLETED state)");

  // Test 5: Cancellation APIs
  console.log("\n[Test 5] Task Cancellation APIs (cancelTask, cancelAgentTasks, cancelAll)...");
  const cancelTask1: BrowserTask = {
    id: 'cancel-1', agentId: 'AgentX', priority: 'NORMAL', scope: LockScope.TAB, targetKey: 'tab1',
    action: async () => {}, state: BrowserTaskState.QUEUED, enqueuedAt: Date.now(), agingScore: 0,
    retryPolicy: { strategy: RetryStrategy.NO_RETRY, maxAttempts: 1, backoffFactorMs: 0 }, attemptsCount: 1
  };
  const cancelTask2: BrowserTask = {
    id: 'cancel-2', agentId: 'AgentX', priority: 'NORMAL', scope: LockScope.TAB, targetKey: 'tab2',
    action: async () => {}, state: BrowserTaskState.QUEUED, enqueuedAt: Date.now(), agingScore: 0,
    retryPolicy: { strategy: RetryStrategy.NO_RETRY, maxAttempts: 1, backoffFactorMs: 0 }, attemptsCount: 1
  };

  mgr.submitTask(cancelTask1);
  mgr.submitTask(cancelTask2);
  assert.strictEqual(mgr.cancelTask('cancel-1'), true);
  assert.strictEqual(cancelTask1.state, BrowserTaskState.CANCELLED);

  const cancelledCount = mgr.cancelAgentTasks('AgentX');
  assert.strictEqual(cancelledCount, 1);
  assert.strictEqual(cancelTask2.state, BrowserTaskState.CANCELLED);
  console.log("   ✓ Test 5 Passed (cancelTask and cancelAgentTasks verified)");

  // Test 6: Worker Policy & Queue Overflow Guard
  console.log("\n[Test 6] Worker Policy Queue Overflow Enforcement...");
  assert.throws(
    () => BrowserWorkerPolicy.validateQueueCapacity(100),
    WorkerQueueOverflowException,
    'Enqueuing when capacity reaches MAX_QUEUE_SIZE must throw WorkerQueueOverflowException'
  );
  console.log("   ✓ Test 6 Passed (MAX_QUEUE_SIZE overflow blocked)");

  // Test 7: Worker Metrics Reporting
  console.log("\n[Test 7] BrowserWorkerMetrics Reporting...");
  const metrics = mgr.getMetrics();
  assert.ok(typeof metrics.queueLength === 'number');
  assert.ok(typeof metrics.averageWaitTimeMs === 'number');
  assert.ok(typeof metrics.averageExecutionTimeMs === 'number');
  console.log("   ✓ Test 7 Passed (Worker metrics structure validated)");

  console.log("\n==================================================");
  console.log("   ALL BROWSER WORKER FOUNDATION TESTS PASSED!");
  console.log("==================================================");
}

runBrowserWorkerFoundationTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
