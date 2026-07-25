import { AIOSEventBus } from '../../../../../sdk/core/event/AIOSEventBus';
import { TelemetryFactory } from '../../../../../sdk/core/telemetry/TelemetryFactory';
import { MetricName } from '../../../../../sdk/core/telemetry/MetricName';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running TelemetryDispatcher tests...');

  // Setup EventBus and Telemetry components
  const bus = new AIOSEventBus();
  const { repository, dispatcher } = TelemetryFactory.createInMemory();

  bus.subscribe('*', async (event) => {
    await dispatcher.onEvent(event);
  });

  // Test 1: Multiple Metrics Generation (1 Event -> 2 TelemetryRecords)
  const completedEvent = {
    eventId: 'EVT-COMPLETED',
    eventType: 'ExecutionCompleted',
    eventVersion: '1.0.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.test',
    correlationId: 'CORR-INT-A',
    causationId: 'CAUS-INT-A',
    payload: {
      executionId: 'EXEC-INT-A',
      durationMs: 820,
      status: 'PASS'
    }
  };

  await bus.publish(completedEvent);

  const execRecords = await repository.findByExecutionId('EXEC-INT-A');
  assert(execRecords.length === 2, 'ExecutionCompleted should yield exactly 2 TelemetryRecords (Duration and simulated Cost)');
  
  const durationRecord = execRecords.find(r => r.metricName === MetricName.EXECUTION_DURATION);
  const costRecord = execRecords.find(r => r.metricName === MetricName.EXECUTION_COST);

  assert(durationRecord !== undefined && durationRecord.value === 820, 'Duration value should match payload');
  assert(costRecord !== undefined && costRecord.value === 0.05, 'Simulated Cost should match mapped value');

  // Test 2: Unknown Event Test (Should skip, not crash)
  const unknownEvent = {
    eventId: 'EVT-UNKNOWN',
    eventType: 'UnknownAction',
    eventVersion: '1.0.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.test',
    correlationId: 'CORR-INT-B',
    causationId: 'CAUS-INT-B',
    payload: {}
  };

  let threwError = false;
  try {
    await bus.publish(unknownEvent);
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

