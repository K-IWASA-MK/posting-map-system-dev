import { InMemoryMetricsRepository } from '../../../../../../sdk/core/aios/metrics/InMemoryMetricsRepository';
import { MetricAggregationType } from '../../../../../../sdk/core/aios/metrics/MetricAggregationType';
import { MetricWindow } from '../../../../../../sdk/core/aios/metrics/MetricWindow';
import { MetricCategory } from '../../../../../../sdk/core/aios/telemetry/MetricCategory';
import { MetricUnit } from '../../../../../../sdk/core/aios/telemetry/MetricUnit';
import { MetricName } from '../../../../../../sdk/core/aios/telemetry/MetricName';
import { MetricRecord } from '../../../../../../sdk/core/aios/metrics/MetricRecord';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running InMemoryMetricsRepository tests...');

  const repo = new InMemoryMetricsRepository();

  const validRecord: MetricRecord = Object.freeze({
    metricId: 'EXEC-A',
    metricName: MetricName.EXECUTION_DURATION,
    metricCategory: MetricCategory.EXECUTION,
    aggregationType: MetricAggregationType.AVERAGE,
    window: MetricWindow.EXECUTION,
    value: 12.5,
    unit: MetricUnit.MS,
    sampleCount: 4,
    generatedAt: new Date().toISOString(),
    schemaVersion: '1.0.0'
  });

  // Test 1: Successful Save & Immutability
  await repo.save(validRecord);
  assert(await repo.count() === 1, 'Should save metric record');
  
  let throwsOnMutate = false;
  try {
    (validRecord as any).value = 999;
  } catch (e) {
    throwsOnMutate = true;
  }
  assert(throwsOnMutate, 'MetricRecord must be immutable');

  // Test 2: Save Policy (Replace Duplicate Key)
  const replaceRecord: MetricRecord = Object.freeze({
    metricId: 'EXEC-A', // same window/metricId key
    metricName: MetricName.EXECUTION_DURATION,
    metricCategory: MetricCategory.EXECUTION,
    aggregationType: MetricAggregationType.AVERAGE,
    window: MetricWindow.EXECUTION,
    value: 25.0, // updated value
    unit: MetricUnit.MS,
    sampleCount: 5,
    generatedAt: new Date().toISOString(),
    schemaVersion: '1.0.0'
  });

  await repo.save(replaceRecord);
  assert(await repo.count() === 1, 'Count should remain 1 after replace update');
  
  const records = await repo.findByMetricName(MetricName.EXECUTION_DURATION);
  assert(records[0].value === 25.0, 'Replaced value should be 25.0');
  assert(records[0].sampleCount === 5, 'Replaced sample count should be 5');

  // Test 3: Unsupported Aggregation Verification (Definition Validation)
  const invalidRecord: MetricRecord = Object.freeze({
    metricId: 'EXEC-A',
    metricName: MetricName.REVIEWER_CONFIDENCE,
    metricCategory: MetricCategory.QUALITY,
    aggregationType: MetricAggregationType.SUM, // SUM is unsupported for REVIEWER_CONFIDENCE in Registry
    window: MetricWindow.EXECUTION,
    value: 180,
    unit: MetricUnit.PERCENT,
    sampleCount: 2,
    generatedAt: new Date().toISOString(),
    schemaVersion: '1.0.0'
  });

  let threwUnsupported = false;
  try {
    await repo.save(invalidRecord);
  } catch (e: any) {
    threwUnsupported = true;
    assert(e.message.includes('Definition Validation Error'), 'Should reject unsupported aggregation type');
  }
  assert(threwUnsupported, 'Unsupported aggregation type must be rejected');

  console.log('All InMemoryMetricsRepository tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
