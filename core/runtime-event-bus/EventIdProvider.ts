import { IEventIdProvider } from './IEventIdProvider';
import { randomUUID } from 'crypto';

/**
 * EventIdProvider implements IEventIdProvider using standard cryptographic UUIDs.
 */
export class EventIdProvider implements IEventIdProvider {
  public generateEventId(): string {
    return randomUUID();
  }
}
