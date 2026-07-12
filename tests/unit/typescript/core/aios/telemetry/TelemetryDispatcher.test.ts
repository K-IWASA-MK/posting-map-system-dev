import { EventBus } from '../../../../../../src/core/aios/eventbus/EventBus';
import { EventChannel } from '../../../../../../src/core/aios/eventbus/EventChannel';
import { EventType } from '../../../../../../src/core/aios/eventbus/EventType';
import { EventSource } from '../../../../../../src/core/aios/eventbus/EventSource';
import { TelemetryFactory } from '../../../../../../src/core/aios/telemetry/TelemetryFactory';
import { MetricName } from '../../../../../../src/core/aios/telemetry/MetricName';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running TelemetryDispatcher tests...');

  // Setup EventBus and Telemetry components
  const bus = new EventBus();
  const { repository, dispatcher } = TelemetryFactory.createInMemory();

  bus.subscribe({
    subscriptionId: 'SUB-TELEMETRY',
    subscriberName: 'TelemetrySub',
    subscriber: dispatcher
  });

  // Test 1: Multiple Metrics Generation (1 Event -> 2 TelemetryRecords)
  const completedEnvelope = {
    eventId: 'EVT-COMPLETED',
    eventType: EventType.ExecutionCompleted,
    channel: EventChannel.EXECUTION,
    source: EventSource.DevelopmentOS,
    executionId: 'EXEC-INT-A',
    correlationId: 'CORR-INT-A',
    timestamp: new Date().toISOString(),
    payloadType: 'ExecutionCompletedPayload',
    payload: {
      executionId: 'EXEC-INT-A',
      durationMs: 820,
      status: 'PASS'
    },
    schemaVersion: '1.0.0'
  };

  await bus.publish(completedEnvelope);

  const execRecords = await repository.findByExecutionId('EXEC-INT-A');
  assert(execRecords.length === 2, 'ExecutionCompleted should yield exactly 2 TelemetryRecords (Duration and simulated Cost)');
  
  const durationRecord = execRecords.find(r => r.metricName === MetricName.EXECUTION_DURATION);
  const costRecord = execRecords.find(r => r.metricName === MetricName.EXECUTION_COST);

  assert(durationRecord !== undefined && durationRecord.value === 820, 'Duration value should match payload');
  assert(costRecord !== undefined && costRecord.value === 0.05, 'Simulated Cost should match mapped value');

  // Test 2: Unknown Event Test (Should skip, not crash)
  const unknownEnvelope = {
    eventId: 'EVT-UNKNOWN',
    eventType: 'UnknownAction' as any, // Unregistered / unknown event type
    channel: EventChannel.EXECUTION,
    source: EventSource.DevelopmentOS,
    executionId: 'EXEC-INT-B',
    correlationId: 'CORR-INT-B',
    timestamp: new Date().toISOString(),
    payloadType: 'UnknownPayload',
    payload: {},
    schemaVersion: '1.0.0'
  };

  let threwError = false;
  try {
    await bus.publish(unknownEnvelope);
  } catch (e) {
    threwError = true;
  }

  assert(!threwError, 'Unknown event should be gracefully skipped, not throw an error');
  const unknownRecords = await repository.findByExecutionId('EXEC-INT-B');
  assert(unknownRecords.length === 0, 'No records should be created for unknown event types');

  console.log('All TelemetryDispatcher tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
