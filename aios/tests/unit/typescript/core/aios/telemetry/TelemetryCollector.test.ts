import { TelemetryCollector } from '../../../../../../sdk/core/aios/telemetry/TelemetryCollector';
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
  console.log('Running TelemetryCollector tests...');

  const repo = new InMemoryTelemetryRepository();
  const collector = new TelemetryCollector(repo);

  // Test 1: Successful Collection
  const validRecord = Object.freeze({
    recordId: 'TEL-1',
    executionId: 'EXEC-1',
    correlationId: 'CORR-1',
    metricCategory: MetricCategory.EXECUTION,
    metricName: MetricName.EXECUTION_DURATION,
    value: 150,
    unit: MetricUnit.MS,
    timestamp: new Date().toISOString(),
    source: 'Engine',
    sourceType: 'Execution' as any,
    schemaVersion: '1.0.0'
  });

  await collector.collect(validRecord);
  assert(await repo.count() === 1, 'Should save record to repository');

  // Test 2: Validation Failure for non-numeric value
  const invalidRecord = Object.freeze({
    recordId: 'TEL-2',
    executionId: 'EXEC-1',
    correlationId: 'CORR-1',
    metricCategory: MetricCategory.EXECUTION,
    metricName: MetricName.EXECUTION_DURATION,
    value: 'not-a-number' as any, // non-numeric
    unit: MetricUnit.MS,
    timestamp: new Date().toISOString(),
    source: 'Engine',
    sourceType: 'Execution' as any,
    schemaVersion: '1.0.0'
  });

  let threwValidation = false;
  try {
    await collector.collect(invalidRecord);
  } catch (e: any) {
    threwValidation = true;
    assert(e.message.includes('Validation Error'), 'Should yield numeric validation error');
  }
  assert(threwValidation, 'Should validate numeric constraint');

  // Test 3: Validation Failure for unfrozen object
  const unfrozenRecord = {
    recordId: 'TEL-3',
    executionId: 'EXEC-1',
    correlationId: 'CORR-1',
    metricCategory: MetricCategory.EXECUTION,
    metricName: MetricName.EXECUTION_DURATION,
    value: 100,
    unit: MetricUnit.MS,
    timestamp: new Date().toISOString(),
    source: 'Engine',
    sourceType: 'Execution' as any,
    schemaVersion: '1.0.0'
  };

  let threwUnfrozen = false;
  try {
    await collector.collect(unfrozenRecord);
  } catch (e: any) {
    threwUnfrozen = true;
    assert(e.message.includes('must be frozen'), 'Should validate immutability constraint');
  }
  assert(threwUnfrozen, 'Should validate immutability constraint');

  console.log('All TelemetryCollector tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
