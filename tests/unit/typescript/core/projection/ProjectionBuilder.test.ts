import { ProjectionBuilder } from '../../../../../sdk/core/projection/ProjectionBuilder';
import { InMemoryProjectionRepository } from '../../../../../sdk/core/projection/InMemoryProjectionRepository';
import { ProjectionState } from '../../../../../sdk/core/projection/ProjectionState';
import { ProjectionStage } from '../../../../../sdk/core/projection/ProjectionStage';
import { AIOSEvent } from '../../../../../sdk/core/event/AIOSEvent';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function mockEvent(type: string, execId: string): AIOSEvent {
  return {
    eventId: `EVT-${Date.now()}-${Math.random()}`,
    eventType: type,
    eventVersion: '1.0.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.test',
    correlationId: 'CORR-1',
    causationId: 'CAUS-1',
    payload: {
      executionId: execId
    }
  };
}

async function runTests() {
  console.log('Running ProjectionBuilder tests...');

  const repo = new InMemoryProjectionRepository();
  const builder = new ProjectionBuilder(repo);

  const execId = 'EXEC-TRANS-1';

  // 1. Initial Transition: READY -> RUNNING (Started)
  await builder.build(mockEvent('ExecutionStarted', execId));
  const snap1 = await repo.findById(execId);
  assert(snap1 !== null, 'Snapshot should be built');
  assert(snap1!.projection.status === ProjectionState.RUNNING, 'State should transition to RUNNING');
  assert(snap1!.projection.currentStage === ProjectionStage.CONTEXT, 'Stage should be CONTEXT');
  assert(snap1!.projectionVersion === 1, 'Version should be 1');

  // 2. Next Transition: RUNNING -> RUNNING (Validation Started)
  await builder.build(mockEvent('ValidationStarted', execId));
  const snap2 = await repo.findById(execId);
  assert(snap2!.projection.status === ProjectionState.RUNNING, 'State should remain RUNNING');
  assert(snap2!.projection.currentStage === ProjectionStage.VALIDATION, 'Stage should update to VALIDATION');
  assert(snap2!.projectionVersion === 2, 'Version should increment to 2');

  // 3. Final Transition: RUNNING -> COMPLETED
  await builder.build(mockEvent('ExecutionCompleted', execId));
  const snap3 = await repo.findById(execId);
  assert(snap3!.projection.status === ProjectionState.COMPLETED, 'State should transition to COMPLETED');
  assert(snap3!.projectionVersion === 3, 'Version should increment to 3');

  // 4. Invalid Transition: COMPLETED -> RUNNING (Should be blocked and ignored)
  await builder.build(mockEvent('ExecutionStarted', execId));
  const snap4 = await repo.findById(execId);
  assert(snap4!.projection.status === ProjectionState.COMPLETED, 'Transition COMPLETED -> RUNNING should be rejected/ignored');
  assert(snap4!.projectionVersion === 3, 'Version should not increment on blocked transition');

  console.log('All ProjectionBuilder tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});

