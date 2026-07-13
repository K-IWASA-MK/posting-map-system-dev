import { InMemoryTelemetryRepository } from '../../../../../../sdk/core/aios/telemetry/InMemoryTelemetryRepository';
import { MetricCategory } from '../../../../../../sdk/core/aios/telemetry/MetricCategory';
import { MetricUnit } from '../../../../../../sdk/core/aios/telemetry/MetricUnit';
import { MetricName } from '../../../../../../sdk/core/aios/telemetry/MetricName';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running InMemoryTelemetryRepository tests...');

  const repo = new InMemoryTelemetryRepository();
  
  await repo.save({
    recordId: 'TEL-1',
    executionId: 'EXEC-A',
    correlationId: 'CORR-1',
    metricCategory: MetricCategory.EXECUTION,
    metricName: MetricName.EXECUTION_DURATION,
    value: 10,
    unit: MetricUnit.MS,
    timestamp: new Date().toISOString(),
    source: 'Engine',
    sourceType: 'Execution',
    schemaVersion: '1.0.0'
  });

  // Test save & exist & count
  assert(await repo.count() === 1, 'Count should be 1');
  assert(await repo.exists('TEL-1') === true, 'TEL-1 should exist');
  assert(await repo.exists('TEL-UNKNOWN') === false, 'Unknown ID should not exist');

  // Test findByExecutionId
  const result = await repo.findByExecutionId('EXEC-A');
  assert(result.length === 1, 'Should find 1 record by execution ID');
  assert(result[0].recordId === 'TEL-1', 'Record ID should match');

  // Test Repository Capacity (1000 items)
  console.log('Running Repository Capacity Test (5000 items)...');
  for (let i = 0; i < 5000; i++) {
    await repo.save({
      recordId: `TEL-CAP-${i}`,
      executionId: 'EXEC-CAP',
      correlationId: 'CORR-CAP',
      metricCategory: MetricCategory.RESOURCE,
      metricName: MetricName.EXECUTION_MEMORY,
      value: 1024 + i,
      unit: MetricUnit.BYTES,
      timestamp: new Date().toISOString(),
      source: 'System',
      sourceType: 'System',
      schemaVersion: '1.0.0'
    });
  }

  assert(await repo.count() === 5001, 'Should contain 5001 total records');
  const capResults = await repo.findByExecutionId('EXEC-CAP');
  assert(capResults.length === 5000, 'Should retrieve 5000 records of capacity test');

  console.log('All InMemoryTelemetryRepository tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
