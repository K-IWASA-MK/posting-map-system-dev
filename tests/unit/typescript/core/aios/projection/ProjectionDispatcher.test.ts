import { EventBus } from '../../../../../../src/core/aios/eventbus/EventBus';
import { EventChannel } from '../../../../../../src/core/aios/eventbus/EventChannel';
import { EventType } from '../../../../../../src/core/aios/eventbus/EventType';
import { EventSource } from '../../../../../../src/core/aios/eventbus/EventSource';
import { ProjectionFactory } from '../../../../../../src/core/aios/projection/ProjectionFactory';
import { ProjectionState } from '../../../../../../src/core/aios/projection/ProjectionState';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running ProjectionDispatcher tests...');

  const bus = new EventBus();
  const { repository, dispatcher } = ProjectionFactory.createInMemory();

  bus.subscribe({
    subscriptionId: 'SUB-PROJECTION',
    subscriberName: 'ProjectionSub',
    subscriber: dispatcher
  });

  const execId = 'EXEC-DISP-1';

  // 1. Publish ExecutionStarted
  await bus.publish({
    eventId: 'EVT-1',
    eventType: EventType.ExecutionStarted,
    channel: EventChannel.EXECUTION,
    source: EventSource.DevelopmentOS,
    executionId: execId,
    correlationId: 'CORR-1',
    timestamp: new Date().toISOString(),
    payloadType: 'ExecutionStartedPayload',
    payload: {},
    schemaVersion: '1.0.0'
  });

  const snap1 = await repository.findById(execId);
  assert(snap1 !== null, 'Snapshot should be created');
  assert(snap1!.projection.status === ProjectionState.RUNNING, 'State should be RUNNING');
  assert(snap1!.projectionVersion === 1, 'Version should be 1');

  // 2. Unknown Event Test
  await bus.publish({
    eventId: 'EVT-UNKNOWN',
    eventType: 'UnknownAction' as any,
    channel: EventChannel.EXECUTION,
    source: EventSource.DevelopmentOS,
    executionId: execId,
    correlationId: 'CORR-1',
    timestamp: new Date().toISOString(),
    payloadType: 'UnknownPayload',
    payload: {},
    schemaVersion: '1.0.0'
  });

  const snap2 = await repository.findById(execId);
  assert(snap2!.projectionVersion === 1, 'Version should not increment for unknown event');
  assert(snap2!.projection.status === ProjectionState.RUNNING, 'State should remain unchanged');

  // 3. Immutability validation (Object.freeze check)
  let throwsOnMutate = false;
  try {
    (snap2 as any).projectionVersion = 99;
  } catch (e) {
    throwsOnMutate = true;
  }
  assert(throwsOnMutate, 'ProjectionSnapshot must be completely frozen');

  console.log('All ProjectionDispatcher tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
