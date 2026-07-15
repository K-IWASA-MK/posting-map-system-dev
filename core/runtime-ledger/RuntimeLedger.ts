import { IRuntimeLedger } from './IRuntimeLedger';
import { LedgerEntry } from './LedgerEntry';
import { LedgerQueryFilter } from './LedgerQueryFilter';
import { RuntimeLedgerMetrics } from './RuntimeLedgerMetrics';
import { ILedgerStorage } from './ILedgerStorage';
import { LedgerEntryFactory } from './LedgerEntryFactory';
import { RuntimeLedgerSubscriber } from './RuntimeLedgerSubscriber';
import { IRuntimeEventBus } from '../runtime-event-bus/IRuntimeEventBus';

/**
 * RuntimeLedger processes event bus streams, converting them into persistent audit trails.
 * Conforms to: pure observer (no mutations, append-only, storage failure isolation).
 */
export class RuntimeLedger implements IRuntimeLedger {
  private readonly storage: ILedgerStorage;
  private readonly factory: LedgerEntryFactory;
  private readonly subscriber: RuntimeLedgerSubscriber;
  private readonly metrics = new RuntimeLedgerMetrics();

  constructor(
    storage: ILedgerStorage,
    factory: LedgerEntryFactory,
    eventBus: IRuntimeEventBus
  ) {
    this.storage = storage;
    this.factory = factory;

    this.subscriber = new RuntimeLedgerSubscriber(eventBus, (event) => {
      this.handleEvent(event);
    });
  }

  /**
   * Queries historical log entries matching filters.
   */
  public async query(filter?: LedgerQueryFilter): Promise<LedgerEntry[]> {
    return this.storage.query(filter);
  }

  public getMetrics(): RuntimeLedgerMetrics {
    return this.metrics;
  }

  public reset(): void {
    this.metrics.reset();
  }

  public stop(): void {
    this.subscriber.stop();
  }

  private handleEvent(event: any): void {
    this.metrics.totalEntries++;
    const entry = this.factory.create(event);

    // Storage Failure Isolation: handle promise rejection/errors to protect Event Bus flow
    this.storage.append(entry).then(
      (result) => {
        if (result.success) {
          this.metrics.successfulWrites++;
          this.metrics.lastWriteTimestamp = Date.now();
        } else {
          this.metrics.writeFailures++;
        }
      },
      (err) => {
        console.warn('[RuntimeLedger] Isolated storage append crash:', err);
        this.metrics.writeFailures++;
      }
    );
  }
}
