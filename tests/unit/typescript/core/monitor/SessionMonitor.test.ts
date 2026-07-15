import { SessionMonitor } from '../../../../../sdk/core/monitor/SessionMonitor';
import { InMemoryProjectionRepository } from '../../../../../sdk/core/projection/InMemoryProjectionRepository';
import { ProjectionState } from '../../../../../sdk/core/projection/ProjectionState';
import { ProjectionStage } from '../../../../../sdk/core/projection/ProjectionStage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running SessionMonitor tests...');

  const repo = new InMemoryProjectionRepository();
  const monitor = new SessionMonitor(repo);

  // Initial count
  const res1 = await monitor.query();
  assert(res1.active === 0 && res1.completed === 0 && res1.failed === 0, 'Initial counts should be zero');

  // Setup multi-state projections
  await repo.save({
    projectionVersion: 1,
    generatedAt: '',
    projection: { projectionId: 'P1', executionId: 'EX-1', correlationId: 'C-1', currentStage: ProjectionStage.CONTEXT, status: ProjectionState.RUNNING, source: '', updatedAt: '', schemaVersion: '' }
  });

  await repo.save({
    projectionVersion: 1,
    generatedAt: '',
    projection: { projectionId: 'P2', executionId: 'EX-2', correlationId: 'C-1', currentStage: ProjectionStage.COMPLETED, status: ProjectionState.COMPLETED, source: '', updatedAt: '', schemaVersion: '' }
  });

  await repo.save({
    projectionVersion: 1,
    generatedAt: '',
    projection: { projectionId: 'P3', executionId: 'EX-3', correlationId: 'C-1', currentStage: ProjectionStage.NONE, status: ProjectionState.ERROR, source: '', updatedAt: '', schemaVersion: '' }
  });

  const res2 = await monitor.query();
  assert(res2.active === 1, 'Should have 1 active session');
  assert(res2.completed === 1, 'Should have 1 completed session');
  assert(res2.failed === 1, 'Should have 1 failed session');

  console.log('All SessionMonitor tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
