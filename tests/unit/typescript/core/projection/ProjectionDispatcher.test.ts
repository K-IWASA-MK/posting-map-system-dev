import { AIOSEventBus } from '../../../../../sdk/core/event/AIOSEventBus';
import { ProjectionFactory } from '../../../../../sdk/core/projection/ProjectionFactory';
import { ProjectionState } from '../../../../../sdk/core/projection/ProjectionState';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running ProjectionDispatcher tests...');

  const bus = new AIOSEventBus();
  const { repository, dispatcher } = ProjectionFactory.createInMemory();

  bus.subscribe('*', async (event) => {
    await dispatcher.onEvent(event);
  });

  const execId = 'EXEC-DISP-1';

  // 1. Publish ExecutionStarted
  await bus.publish({
    eventId: 'EVT-1',
    eventType: 'ExecutionStarted',
    eventVersion: '1.0.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.test',
    correlationId: 'CORR-1',
    causationId: 'CAUS-1',
    payload: {
      executionId: execId
    }
  });

  const snap1 = await repository.findById(execId);
  assert(snap1 !== null, 'Snapshot should be created');
  assert(snap1!.projection.status === ProjectionState.RUNNING, 'State should be RUNNING');
  assert(snap1!.projectionVersion === 1, 'Version should be 1');

  // 2. Unknown Event Test
  await bus.publish({
    eventId: 'EVT-UNKNOWN',
    eventType: 'UnknownAction',
    eventVersion: '1.0.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.test',
    correlationId: 'CORR-1',
    causationId: 'CAUS-1',
    payload: {
      executionId: execId
    }
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

