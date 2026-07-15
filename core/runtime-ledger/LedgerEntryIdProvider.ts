import { ILedgerEntryIdProvider } from './ILedgerEntryIdProvider';
import * as crypto from 'crypto';

/**
 * LedgerEntryIdProvider generates random v4 UUID identifiers.
 */
export class LedgerEntryIdProvider implements ILedgerEntryIdProvider {
  public generateEntryId(): string {
    return crypto.randomUUID();
  }
}
