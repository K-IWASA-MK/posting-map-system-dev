import { ApplicationEventPublisher } from '@application/events/ApplicationEventPublisher';
import { FlyerReservedEvent } from '@domain/field/events/FieldEvent';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test ApplicationEventPublisher] Verifying publisher...');

  const publisher = new ApplicationEventPublisher();
  const event = new FlyerReservedEvent('STOCK-1', 'OWNER-1', 100, 900);

  publisher.publish(event);
  assert(publisher.publishedEvents.length === 1, 'Event must be recorded');
  assert(publisher.publishedEvents[0].eventId === event.eventId, 'Event ID mismatch');
  assert(publisher.publishedEvents[0].aggregateId === 'STOCK-1', 'Aggregate ID mismatch');

  console.log('[Test ApplicationEventPublisher] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
