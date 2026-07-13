import { TelemetryLearningSource } from '../../../../../../../sdk/core/aios/learning/source/sources/TelemetryLearningSource';
import { InMemoryTelemetryRepository } from '../../../../../../../sdk/core/aios/telemetry/InMemoryTelemetryRepository';
import { MetricCategory } from '../../../../../../../sdk/core/aios/telemetry/MetricCategory';
import { MetricUnit } from '../../../../../../../sdk/core/aios/telemetry/MetricUnit';
import { MetricName } from '../../../../../../../sdk/core/aios/telemetry/MetricName';
import { SourceType } from '../../../../../../../sdk/core/aios/learning/source/SourceType';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running TelemetryLearningSource tests...');

  const repo = new InMemoryTelemetryRepository();
  const source = new TelemetryLearningSource(repo);

  await repo.save({
    recordId: 'TEL-1',
    executionId: 'EX-1',
    correlationId: 'C-1',
    metricCategory: MetricCategory.EXECUTION,
    metricName: MetricName.EXECUTION_DURATION,
    value: 120,
    unit: MetricUnit.MS,
    timestamp: '2026-07-12T12:00:00Z',
    source: 'Engine',
    sourceType: 'Execution',
    schemaVersion: '1.0.0'
  });

  const request = {
    requestId: 'REQ-1',
    sourceType: SourceType.TELEMETRY,
    executionId: 'EX-1',
    filters: {},
    schemaVersion: '1.0.0'
  };

  const dataset = await source.load(request);
  assert(dataset.metadata.recordCount === 1, 'Should find 1 telemetry record');
  assert(dataset.records[0].recordId === 'TEL-1', 'Record ID should align');

  console.log('All TelemetryLearningSource tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
