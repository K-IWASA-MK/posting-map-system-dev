import { InMemoryTelemetryRepository } from '../../../../../../sdk/core/aios/telemetry/InMemoryTelemetryRepository';
import { InMemoryMetricsRepository } from '../../../../../../sdk/core/aios/metrics/InMemoryMetricsRepository';
import { MetricAggregator } from '../../../../../../sdk/core/aios/metrics/MetricAggregator';
import { MetricsDispatcher } from '../../../../../../sdk/core/aios/metrics/MetricsDispatcher';
import { MetricName } from '../../../../../../sdk/core/aios/telemetry/MetricName';
import { MetricCategory } from '../../../../../../sdk/core/aios/telemetry/MetricCategory';
import { MetricUnit } from '../../../../../../sdk/core/aios/telemetry/MetricUnit';
import { MetricWindow } from '../../../../../../sdk/core/aios/metrics/MetricWindow';
import { MetricAggregationType } from '../../../../../../sdk/core/aios/metrics/MetricAggregationType';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running MetricsDispatcher integration tests...');

  const telemetryRepo = new InMemoryTelemetryRepository();
  const metricsRepo = new InMemoryMetricsRepository();
  const aggregator = new MetricAggregator();
  const dispatcher = new MetricsDispatcher(telemetryRepo, metricsRepo, aggregator);

  // Test 1: Window Boundary Test (12:00:59 and 12:01:00 should separate ONE_MINUTE window)
  await telemetryRepo.save({
    recordId: 'T1',
    executionId: 'EX-1',
    correlationId: 'C-1',
    metricCategory: MetricCategory.EXECUTION,
    metricName: MetricName.EXECUTION_DURATION,
    value: 50,
    unit: MetricUnit.MS,
    timestamp: '2026-07-12T12:00:59.000Z', // Minute 12:00
    source: 'Engine',
    sourceType: 'Execution',
    schemaVersion: '1.0.0'
  });

  await telemetryRepo.save({
    recordId: 'T2',
    executionId: 'EX-2',
    correlationId: 'C-1',
    metricCategory: MetricCategory.EXECUTION,
    metricName: MetricName.EXECUTION_DURATION,
    value: 100,
    unit: MetricUnit.MS,
    timestamp: '2026-07-12T12:01:00.000Z', // Minute 12:01
    source: 'Engine',
    sourceType: 'Execution',
    schemaVersion: '1.0.0'
  });

  await dispatcher.aggregateAndStore(
    MetricName.EXECUTION_DURATION,
    MetricWindow.ONE_MINUTE,
    MetricAggregationType.AVERAGE
  );

  assert(await metricsRepo.count() === 2, 'Should create 2 distinct MetricRecords due to minute boundary separation');

  // Test 2: Large Dataset Test (10,000 items)
  console.log('Running Large Dataset Test (10,000 telemetry records)...');
  const largeTelemetryRepo = new InMemoryTelemetryRepository();
  const startTime = Date.now();

  for (let i = 0; i < 10000; i++) {
    await largeTelemetryRepo.save({
      recordId: `T-L-${i}`,
      executionId: `EXEC-L-${Math.floor(i / 10)}`, // 10 records per executionId -> 1000 distinct execution groups
      correlationId: 'C-L',
      metricCategory: MetricCategory.EXECUTION,
      metricName: MetricName.EXECUTION_DURATION,
      value: 10 + (i % 100),
      unit: MetricUnit.MS,
      timestamp: new Date().toISOString(),
      source: 'Engine',
      sourceType: 'Execution',
      schemaVersion: '1.0.0'
    });
  }

  const largeDispatcher = new MetricsDispatcher(largeTelemetryRepo, metricsRepo, aggregator);
  await largeDispatcher.aggregateAndStore(
    MetricName.EXECUTION_DURATION,
    MetricWindow.EXECUTION,
    MetricAggregationType.AVERAGE
  );

  const duration = Date.now() - startTime;
  console.log(`Large Dataset Test completed in ${duration}ms`);
  
  // Checking count (2 boundary records from Test 1 + 1000 aggregated records from Test 2)
  const totalCount = await metricsRepo.count();
  assert(totalCount === 1002, `Should have 1002 total records in MetricsRepository. Got ${totalCount}`);

  console.log('All MetricsDispatcher integration tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
