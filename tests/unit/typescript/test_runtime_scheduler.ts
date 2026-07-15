import { SchedulerPriority } from '../../../core/runtime-scheduler/SchedulerPriority';
import { SchedulerTask } from '../../../core/runtime-scheduler/SchedulerTask';
import { SchedulerQueue } from '../../../core/runtime-scheduler/SchedulerQueue';
import { PriorityOrderingStrategy } from '../../../core/runtime-scheduler/PriorityOrderingStrategy';
import { ISessionDispatcher } from '../../../core/runtime-scheduler/ISessionDispatcher';
import { DispatchResult } from '../../../core/runtime-scheduler/DispatchResult';
import { RuntimeEventBus } from '../../../core/runtime-event-bus/RuntimeEventBus';
import { RuntimeScheduler } from '../../../core/runtime-scheduler/RuntimeScheduler';
import { SchedulerError } from '../../../core/runtime-scheduler/RuntimeSchedulerErrors';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockEventIdProvider {
  private count = 0;
  public generateEventId(): string {
    this.count++;
    return `ev-${this.count}`;
  }
}

class MockDispatcher implements ISessionDispatcher {
  public dispatched: string[] = [];

  public async dispatch(task: SchedulerTask): Promise<DispatchResult> {
    this.dispatched.push(task.taskId);
    return {
      success: true,
      sessionId: `session-${task.taskId}`,
      taskId: task.taskId,
      startedAt: Date.now()
    };
  }
}

function buildMockTask(id: string, priority: SchedulerPriority, time: number): SchedulerTask {
  return {
    taskId: id,
    projectId: 'proj-abc',
    priority,
    payload: {
      launcherResult: {
        success: true,
        projectId: 'proj-abc',
        mode: 'production',
        decision: 'allow',
        reasons: [],
        errorCodes: [],
        warnings: [],
        bootTimestamp: Date.now()
      },
      executionConfig: { env: {}, args: [] }
    },
    enqueuedAt: time
  };
}

// Test 1: Sorting Strategy Order
function testQueueSorting() {
  console.log('[Test 1] Queue sorting starting...');
  const strategy = new PriorityOrderingStrategy();
  const queue = new SchedulerQueue(strategy);

  const tLow = buildMockTask('task-low', 'low', 1000);
  const tHigh = buildMockTask('task-high', 'high', 2000);
  const tNormal = buildMockTask('task-normal', 'normal', 3000);
  const tNormal2 = buildMockTask('task-normal-2', 'normal', 4000);

  queue.enqueue(tLow);
  queue.enqueue(tNormal2);
  queue.enqueue(tHigh);
  queue.enqueue(tNormal);

  assert(queue.size() === 4, 'Expected size of 4');

  assert(queue.dequeue()?.taskId === 'task-high', 'High first');
  assert(queue.dequeue()?.taskId === 'task-normal', 'Normal first by timestamp');
  assert(queue.dequeue()?.taskId === 'task-normal-2', 'Normal second');
  assert(queue.dequeue()?.taskId === 'task-low', 'Low last');

  console.log('[Test 1] Queue sorting: PASSED');
}

// Test 2: Concurrency Bounds & Deferred Dispatch
function testConcurrencyAndDeferred() {
  console.log('[Test 2] Concurrency bounds starting...');
  const strategy = new PriorityOrderingStrategy();
  const queue = new SchedulerQueue(strategy);
  const dispatcher = new MockDispatcher();
  const eventBus = new RuntimeEventBus(new MockEventIdProvider());
  const scheduler = new RuntimeScheduler(queue, dispatcher, eventBus, 2);

  const t1 = buildMockTask('task-1', 'high', 1000);
  const t2 = buildMockTask('task-2', 'normal', 1100);
  const t3 = buildMockTask('task-3', 'low', 1200);

  scheduler.schedule(t1);
  scheduler.schedule(t2);
  scheduler.schedule(t3);

  assert(dispatcher.dispatched.includes('task-1'), 'task-1 immediate');
  assert(dispatcher.dispatched.includes('task-2'), 'task-2 immediate');
  assert(!dispatcher.dispatched.includes('task-3'), 'task-3 deferred in queue');

  const metrics = scheduler.getMetrics();
  assert(metrics.queueLength === 1, 'Expected queue size 1');
  assert(metrics.activeDispatches === 2, 'Expected active dispatches 2');

  console.log('[Test 2] Concurrency bounds: PASSED');
  scheduler.stop();
}

// Test 3: Event-driven Dequeuing
function testEventDrivenDequeuing() {
  console.log('[Test 3] Event-driven dequeuing starting...');
  const strategy = new PriorityOrderingStrategy();
  const queue = new SchedulerQueue(strategy);
  const dispatcher = new MockDispatcher();
  const idProv = new MockEventIdProvider();
  const eventBus = new RuntimeEventBus(idProv);
  const scheduler = new RuntimeScheduler(queue, dispatcher, eventBus, 1);

  const t1 = buildMockTask('task-1', 'normal', 1000);
  const t2 = buildMockTask('task-2', 'high', 1100);

  scheduler.schedule(t1);
  scheduler.schedule(t2);

  assert(dispatcher.dispatched.length === 1, 'Exactly 1 active dispatch');
  assert(dispatcher.dispatched[0] === 'task-1', 'task-1 dispatched first');

  // Trigger SESSION_COMPLETED event
  eventBus.publish({
    eventId: idProv.generateEventId(),
    timestamp: Date.now(),
    type: 'SESSION_COMPLETED',
    source: 'ExecutionSession',
    payload: {}
  });

  assert(dispatcher.dispatched.length === 2, 'task-2 dispatched after event');
  assert(dispatcher.dispatched[1] === 'task-2', 'task-2 expected to be run');

  console.log('[Test 3] Event-driven dequeuing: PASSED');
  scheduler.stop();
}

// Test 4: Queue Overflow Exception
function testQueueOverflow() {
  console.log('[Test 4] Queue overflow starting...');
  const strategy = new PriorityOrderingStrategy();
  const queue = new SchedulerQueue(strategy);
  const dispatcher = new MockDispatcher();
  const eventBus = new RuntimeEventBus(new MockEventIdProvider());
  const scheduler = new RuntimeScheduler(queue, dispatcher, eventBus, 1);

  scheduler.schedule(buildMockTask('t-active', 'normal', 100));

  let threwFullError = false;
  try {
    // MAX_QUEUE_SIZE is 100. Enqueue 101 items to overflow
    for (let i = 0; i < 105; i++) {
      scheduler.schedule(buildMockTask(`t-queued-${i}`, 'low', 1000 + i));
    }
  } catch (err: any) {
    if (err instanceof SchedulerError) {
      threwFullError = true;
      assert(err.errorCode === 'SCHEDULER_QUEUE_FULL', 'Expected SCHEDULER_QUEUE_FULL');
    }
  }

  assert(threwFullError, 'Should throw SchedulerError on queue full');
  console.log('[Test 4] Queue overflow: PASSED');
  scheduler.stop();
}

function runAll() {
  console.log('--- Starting Runtime Scheduler Foundation Unit Tests ---');
  testQueueSorting();
  testConcurrencyAndDeferred();
  testEventDrivenDequeuing();
  testQueueOverflow();
  console.log('--- All Runtime Scheduler Foundation Unit Tests PASSED ---');
}

try {
  runAll();
} catch (err) {
  console.error('[Test Suite Error]', err);
  process.exit(1);
}
