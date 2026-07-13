import { InMemoryProjectionRepository } from '../../../../../../sdk/core/aios/projection/InMemoryProjectionRepository';
import { ProjectionState } from '../../../../../../sdk/core/aios/projection/ProjectionState';
import { ProjectionStage } from '../../../../../../sdk/core/aios/projection/ProjectionStage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running InMemoryProjectionRepository tests...');

  const repo = new InMemoryProjectionRepository();

  const snap1 = {
    projection: {
      projectionId: 'PRJ-1',
      executionId: 'EXEC-A',
      correlationId: 'CORR-1',
      currentStage: ProjectionStage.CONTEXT,
      status: ProjectionState.RUNNING,
      source: 'System',
      updatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0'
    },
    projectionVersion: 1,
    generatedAt: new Date().toISOString()
  };

  // Test 1: Save & Find
  await repo.save(snap1);
  assert(await repo.count() === 1, 'Count should be 1');
  assert(await repo.exists('EXEC-A') === true, 'EXEC-A should exist');

  // Test 2: Replace Update (latest only)
  const snap1Updated = {
    ...snap1,
    projectionVersion: 2,
    projection: {
      ...snap1.projection,
      currentStage: ProjectionStage.VALIDATION
    }
  };
  await repo.save(snap1Updated);
  assert(await repo.count() === 1, 'Count should remain 1 after replace');
  
  const fetched = await repo.findById('EXEC-A');
  assert(fetched!.projectionVersion === 2, 'Should retrieve replaced snapshot version 2');
  assert(fetched!.projection.currentStage === ProjectionStage.VALIDATION, 'Replaced stage should match');

  // Test 3: Multi Execution Separation
  const snap2 = {
    projection: {
      projectionId: 'PRJ-2',
      executionId: 'EXEC-B',
      correlationId: 'CORR-2',
      currentStage: ProjectionStage.CONTEXT,
      status: ProjectionState.RUNNING,
      source: 'System',
      updatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0'
    },
    projectionVersion: 1,
    generatedAt: new Date().toISOString()
  };

  await repo.save(snap2);
  assert(await repo.count() === 2, 'Count should be 2 for distinct executions');
  assert(await repo.exists('EXEC-B') === true, 'EXEC-B should exist');

  console.log('All InMemoryProjectionRepository tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
