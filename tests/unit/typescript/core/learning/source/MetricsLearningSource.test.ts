import { MetricsLearningSource } from '../../../../../../sdk/core/learning/source/sources/MetricsLearningSource';
import { InMemoryMetricsRepository } from '../../../../../../sdk/core/metrics/InMemoryMetricsRepository';
import { MetricName } from '../../../../../../sdk/core/telemetry/MetricName';
import { MetricCategory } from '../../../../../../sdk/core/telemetry/MetricCategory';
import { MetricUnit } from '../../../../../../sdk/core/telemetry/MetricUnit';
import { MetricAggregationType } from '../../../../../../sdk/core/metrics/MetricAggregationType';
import { MetricWindow } from '../../../../../../sdk/core/metrics/MetricWindow';
import { SourceType } from '../../../../../../sdk/core/learning/source/SourceType';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running MetricsLearningSource tests...');

  const repo = new InMemoryMetricsRepository();
  const source = new MetricsLearningSource(repo);

  await repo.save({
    metricId: 'MET-1',
    metricName: MetricName.EXECUTION_DURATION,
    metricCategory: MetricCategory.EXECUTION,
    aggregationType: MetricAggregationType.AVERAGE,
    window: MetricWindow.EXECUTION,
    value: 80,
    unit: MetricUnit.MS,
    sampleCount: 1,
    generatedAt: '2026-07-12T12:00:00Z',
    schemaVersion: '1.0.0'
  });

  const request = {
    requestId: 'REQ-1',
    sourceType: SourceType.METRICS,
    filters: { metricName: MetricName.EXECUTION_DURATION },
    schemaVersion: '1.0.0'
  };

  const dataset = await source.load(request);
  assert(dataset.metadata.recordCount === 1, 'Should load 1 metrics record');
  assert(dataset.records[0].recordId === 'MET-1', 'Record ID matches metricId');

  console.log('All MetricsLearningSource tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
