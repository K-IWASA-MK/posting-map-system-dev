import { HealthMonitor } from '../../../../../sdk/core/monitor/HealthMonitor';
import { InMemoryProjectionRepository } from '../../../../../sdk/core/projection/InMemoryProjectionRepository';
import { MonitorStatus } from '../../../../../sdk/core/monitor/MonitorStatus';
import { ProjectionState } from '../../../../../sdk/core/projection/ProjectionState';
import { ProjectionStage } from '../../../../../sdk/core/projection/ProjectionStage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running HealthMonitor tests...');

  const repo = new InMemoryProjectionRepository();
  const monitor = new HealthMonitor(repo);

  // Test 1: Empty repository -> UNKNOWN
  const res1 = await monitor.query();
  assert(res1.status === MonitorStatus.UNKNOWN, 'Empty repo status should be UNKNOWN');

  // Test 2: Normal READY status
  await repo.save({
    projectionVersion: 1,
    generatedAt: '',
    projection: {
      projectionId: 'P1',
      executionId: 'EX-1',
      correlationId: 'C-1',
      currentStage: ProjectionStage.NONE,
      status: ProjectionState.READY,
      source: 'System',
      updatedAt: '',
      schemaVersion: ''
    }
  });

  const res2 = await monitor.query();
  assert(res2.status === MonitorStatus.READY, 'State READY should map to READY');

  // Test 3: Running status
  await repo.save({
    projectionVersion: 1,
    generatedAt: '',
    projection: {
      projectionId: 'P1',
      executionId: 'EX-1',
      correlationId: 'C-1',
      currentStage: ProjectionStage.CONTEXT,
      status: ProjectionState.RUNNING,
      source: 'System',
      updatedAt: '',
      schemaVersion: ''
    }
  });

  const res3 = await monitor.query();
  assert(res3.status === MonitorStatus.RUNNING, 'State RUNNING should map to RUNNING');

  // Test 4: Error status
  await repo.save({
    projectionVersion: 1,
    generatedAt: '',
    projection: {
      projectionId: 'P2',
      executionId: 'EX-2',
      correlationId: 'C-2',
      currentStage: ProjectionStage.NONE,
      status: ProjectionState.ERROR,
      source: 'System',
      updatedAt: '',
      schemaVersion: ''
    }
  });

  const res4 = await monitor.query();
  assert(res4.status === MonitorStatus.ERROR, 'Any ERROR in repo should yield ERROR status');

  console.log('All HealthMonitor tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
