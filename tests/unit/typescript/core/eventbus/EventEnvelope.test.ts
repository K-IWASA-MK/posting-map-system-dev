import { EventEnvelope } from '../../../../../sdk/core/eventbus/EventEnvelope';
import { EventChannel } from '../../../../../sdk/core/eventbus/EventChannel';
import { EventSource } from '../../../../../sdk/core/eventbus/EventSource';
import { EventType } from '../../../../../sdk/core/eventbus/EventType';
import { DefaultEventIdProvider } from '../../../../../sdk/core/eventbus/EventIdProvider';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running EventEnvelope tests...');
  
  const idProvider = new DefaultEventIdProvider();
  
  const envelope: EventEnvelope = Object.freeze({
    eventId: idProvider.nextId(),
    eventType: EventType.ExecutionStarted,
    channel: EventChannel.EXECUTION,
    source: EventSource.DevelopmentOS,
    executionId: 'EXEC-1',
    correlationId: 'SESS-1',
    timestamp: new Date().toISOString(),
    payloadType: 'ExecutionStartedPayload',
    payload: Object.freeze({
      executionId: 'EXEC-1',
      contextId: 'CTX-1',
      triggerSource: 'CLI'
    }),
    schemaVersion: '1.0.0'
  });

  assert(envelope.eventId.startsWith('EVT-'), 'Event ID should start with EVT-');
  assert(envelope.eventType === EventType.ExecutionStarted, 'EventType should match');
  assert(envelope.source === EventSource.DevelopmentOS, 'Source should match');
  assert(envelope.schemaVersion === '1.0.0', 'Schema version should match');

  let throwsOnMutate = false;
  try {
    (envelope as any).executionId = 'EXEC-2';
  } catch (e) {
    throwsOnMutate = true;
  }
  assert(throwsOnMutate, 'Should throw when mutating fields on frozen Envelope');

  console.log('All EventEnvelope tests passed!');
}

runTests();
