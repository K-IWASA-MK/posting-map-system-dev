import { RuntimeEventType } from '../runtime-event-bus/RuntimeEventType';
import { RuntimeEventSource } from '../runtime-event-bus/RuntimeEventSource';
import { LedgerMetadata } from './LedgerMetadata';

/**
 * LedgerEntry represents an immutable record logged by the audit ledger layer.
 */
export interface LedgerEntry {
  readonly entryId: string;
  readonly timestamp: number;
  readonly schemaVersion: number;
  readonly eventId: string;
  readonly eventType: RuntimeEventType;
  readonly source: RuntimeEventSource;
  readonly payload: unknown;
  readonly metadata: LedgerMetadata;
}
