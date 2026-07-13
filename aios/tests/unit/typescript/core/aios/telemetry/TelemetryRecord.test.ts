import { MetricCategory } from '../../../../../../sdk/core/aios/telemetry/MetricCategory';
import { MetricUnit } from '../../../../../../sdk/core/aios/telemetry/MetricUnit';
import { MetricName } from '../../../../../../sdk/core/aios/telemetry/MetricName';
import { TelemetryRecord } from '../../../../../../sdk/core/aios/telemetry/TelemetryRecord';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running TelemetryRecord tests...');

  const record: TelemetryRecord = Object.freeze({
    recordId: 'TEL-1',
    executionId: 'EXEC-1',
    correlationId: 'CORR-1',
    metricCategory: MetricCategory.EXECUTION,
    metricName: MetricName.EXECUTION_DURATION,
    value: 120, // numeric constraint
    unit: MetricUnit.MS,
    timestamp: new Date().toISOString(),
    source: 'Engine',
    sourceType: 'Execution',
    schemaVersion: '1.0.0'
  });

  assert(record.recordId === 'TEL-1', 'Properties should be readable');
  assert(record.value === 120, 'Value should be matching');
  
  let throwsOnMutate = false;
  try {
    (record as any).value = 130;
  } catch (e) {
    throwsOnMutate = true;
  }
  assert(throwsOnMutate, 'Should throw when mutating fields on frozen TelemetryRecord');

  console.log('All TelemetryRecord tests passed!');
}

runTests();
