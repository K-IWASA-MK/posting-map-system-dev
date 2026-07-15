import { MetricAggregator } from '../../../../../sdk/core/metrics/MetricAggregator';
import { MetricAggregationType } from '../../../../../sdk/core/metrics/MetricAggregationType';
import { MetricWindow } from '../../../../../sdk/core/metrics/MetricWindow';
import { MetricCategory } from '../../../../../sdk/core/telemetry/MetricCategory';
import { MetricUnit } from '../../../../../sdk/core/telemetry/MetricUnit';
import { MetricName } from '../../../../../sdk/core/telemetry/MetricName';
import { TelemetryRecord } from '../../../../../sdk/core/telemetry/TelemetryRecord';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function mockRecord(val: number, execId: string): TelemetryRecord {
  return {
    recordId: `TEL-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    executionId: execId,
    correlationId: 'CORR-1',
    metricCategory: MetricCategory.EXECUTION,
    metricName: MetricName.EXECUTION_DURATION,
    value: val,
    unit: MetricUnit.MS,
    timestamp: new Date().toISOString(),
    source: 'Engine',
    sourceType: 'Execution',
    schemaVersion: '1.0.0'
  };
}

async function runTests() {
  console.log('Running MetricAggregator tests...');

  const aggregator = new MetricAggregator();

  // Test 1: Aggregation Logic (Avg, Min, Max, Sum)
  const records = [
    mockRecord(10, 'EXEC-1'),
    mockRecord(20, 'EXEC-1'),
    mockRecord(30, 'EXEC-1')
  ];

  // AVG
  const resAvg = aggregator.aggregate(records, MetricWindow.EXECUTION, MetricAggregationType.AVERAGE);
  assert(resAvg.length === 1 && resAvg[0].value === 20, 'Average should be 20');
  assert(resAvg[0].sampleCount === 3, 'SampleCount should be 3');

  // MIN
  const resMin = aggregator.aggregate(records, MetricWindow.EXECUTION, MetricAggregationType.MIN);
  assert(resMin[0].value === 10, 'Min should be 10');

  // MAX
  const resMax = aggregator.aggregate(records, MetricWindow.EXECUTION, MetricAggregationType.MAX);
  assert(resMax[0].value === 30, 'Max should be 30');

  // SUM
  const resSum = aggregator.aggregate(records, MetricWindow.EXECUTION, MetricAggregationType.SUM);
  assert(resSum[0].value === 60, 'Sum should be 60');

  // Test 2: Empty Data Test (Should not crash and return empty array)
  const resEmpty = aggregator.aggregate([], MetricWindow.EXECUTION, MetricAggregationType.AVERAGE);
  assert(resEmpty.length === 0, 'Empty input should yield 0 metric records');

  console.log('All MetricAggregator tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
