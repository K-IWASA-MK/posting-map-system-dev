import { IClock } from '../runtime-scheduler/IClock';
import { ILedgerEntryIdProvider } from './ILedgerEntryIdProvider';
import { RuntimeEvent } from '../runtime-event-bus/RuntimeEvent';
import { LedgerEntry } from './LedgerEntry';

/**
 * LedgerEntryFactory constructs ledger records from Event Bus streams using injected providers.
 */
export class LedgerEntryFactory {
  private readonly clock: IClock;
  private readonly idProvider: ILedgerEntryIdProvider;

  constructor(clock: IClock, idProvider: ILedgerEntryIdProvider) {
    this.clock = clock;
    this.idProvider = idProvider;
  }

  /**
   * Translates RuntimeEvent to audit trail LedgerEntry.
   * @param event Ingested runtime event.
   */
  public create(event: RuntimeEvent<any>): LedgerEntry {
    return {
      entryId: this.idProvider.generateEntryId(),
      timestamp: this.clock.now(),
      schemaVersion: 1,
      eventId: event.eventId,
      eventType: event.type,
      source: event.source,
      payload: event.payload,
      metadata: {
        requestId: event.requestId,
        sessionId: event.sessionId,
        projectId: event.projectId,
        pluginId: event.pluginId,
        traceId: event.requestId
      }
    };
  }
}
