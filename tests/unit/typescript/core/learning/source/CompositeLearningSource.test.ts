import { CompositeLearningSource } from '../../../../../../sdk/core/learning/source/sources/CompositeLearningSource';
import { LearningSourceRegistry } from '../../../../../../sdk/core/learning/source/LearningSourceRegistry';
import { LedgerLearningSource } from '../../../../../../sdk/core/learning/source/sources/LedgerLearningSource';
import { TelemetryLearningSource } from '../../../../../../sdk/core/learning/source/sources/TelemetryLearningSource';
import { MetricsLearningSource } from '../../../../../../sdk/core/learning/source/sources/MetricsLearningSource';
import { InMemoryTelemetryRepository } from '../../../../../../sdk/core/telemetry/InMemoryTelemetryRepository';
import { InMemoryMetricsRepository } from '../../../../../../sdk/core/metrics/InMemoryMetricsRepository';
import { SourceType } from '../../../../../../sdk/core/learning/source/SourceType';
import { MetricName } from '../../../../../../sdk/core/telemetry/MetricName';
import { MetricCategory } from '../../../../../../sdk/core/telemetry/MetricCategory';
import { MetricUnit } from '../../../../../../sdk/core/telemetry/MetricUnit';
import { MetricAggregationType } from '../../../../../../sdk/core/metrics/MetricAggregationType';
import { MetricWindow } from '../../../../../../sdk/core/metrics/MetricWindow';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockLedgerReader {
  async findByExecutionId(id: string) {
    return {
      entries: [
        { entryId: 'ENT-L1', timestamp: '2026-07-12T12:00:00Z', payload: { action: 'Fact' } }
      ]
    };
  }
}

async function runTests() {
  console.log('Running CompositeLearningSource integration tests...');

  const registry = new LearningSourceRegistry();
  const composite = new CompositeLearningSource(registry);

  const ledgerReader = new MockLedgerReader();
  const telemetryRepo = new InMemoryTelemetryRepository();
  const metricsRepo = new InMemoryMetricsRepository();

  const ledgerSource = new LedgerLearningSource(ledgerReader as any);
  const telemetrySource = new TelemetryLearningSource(telemetryRepo);
  const metricsSource = new MetricsLearningSource(metricsRepo);

  registry.register(ledgerSource);
  registry.register(telemetrySource);
  registry.register(metricsSource);
  registry.register(composite);

  // Setup raw values
  await telemetryRepo.save({
    recordId: 'TEL-1',
    executionId: 'EXEC-X',
    correlationId: 'C-X',
    metricCategory: MetricCategory.EXECUTION,
    metricName: MetricName.EXECUTION_DURATION,
    value: 120,
    unit: MetricUnit.MS,
    timestamp: '2026-07-12T12:00:00Z',
    source: 'Engine',
    sourceType: 'Execution',
    schemaVersion: '1.0.0'
  });

  await metricsRepo.save({
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

  // Test 1: Composite Query (Load all matching data with duplicate deduplication)
  const reqComposite = {
    requestId: 'REQ-COMP',
    sourceType: SourceType.COMPOSITE,
    executionId: 'EXEC-X',
    filters: { metricName: MetricName.EXECUTION_DURATION },
    schemaVersion: '1.0.0'
  };

  const dataset = await composite.load(reqComposite);
  
  // Composite resolver count: Ledger has entries, Telemetry has entries, Metrics has entries matching filters.
  // Record count: ENT-L1 (Ledger) + TEL-1 (Telemetry) + MET-1 (Metrics) = 3 total records.
  assert(dataset.metadata.recordCount === 3, 'Should combine records from all three sub-sources');
  assert(dataset.metadata.sourceCount === 3, 'Metadata sourceCount should indicate 3 distinct active child loaders');

  // Test 2: Immutability (Object.freeze validation)
  let throwsOnMutate = false;
  try {
    (dataset as any).metadata.datasetVersion = 999;
  } catch (e) {
    throwsOnMutate = true;
  }
  assert(throwsOnMutate, 'LearningDataset structure must be frozen');

  console.log('All CompositeLearningSource tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
