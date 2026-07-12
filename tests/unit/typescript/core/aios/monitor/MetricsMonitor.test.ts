import { MetricsMonitor } from '../../../../../../src/core/aios/monitor/MetricsMonitor';
import { InMemoryMetricsRepository } from '../../../../../../src/core/aios/metrics/InMemoryMetricsRepository';
import { MetricName } from '../../../../../../src/core/aios/telemetry/MetricName';
import { MetricCategory } from '../../../../../../src/core/aios/telemetry/MetricCategory';
import { MetricUnit } from '../../../../../../src/core/aios/telemetry/MetricUnit';
import { MetricAggregationType } from '../../../../../../src/core/aios/metrics/MetricAggregationType';
import { MetricWindow } from '../../../../../../src/core/aios/metrics/MetricWindow';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running MetricsMonitor tests...');

  const repo = new InMemoryMetricsRepository();
  const monitor = new MetricsMonitor(repo);

  // Test empty repo
  const res1 = await monitor.query();
  assert(res1.averageExecutionTime === 0 && res1.executionCount === 0, 'Empty values should return 0');

  // Add metrics
  await repo.save({
    metricId: 'M1',
    metricName: MetricName.EXECUTION_DURATION,
    metricCategory: MetricCategory.EXECUTION,
    aggregationType: MetricAggregationType.AVERAGE,
    window: MetricWindow.EXECUTION,
    value: 45.0,
    unit: MetricUnit.MS,
    sampleCount: 15,
    generatedAt: '',
    schemaVersion: '1.0.0'
  });

  const res2 = await monitor.query();
  assert(res2.averageExecutionTime === 45.0, 'Average time should align');
  assert(res2.executionCount === 15, 'ExecutionCount sample size should align');

  console.log('All MetricsMonitor tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
