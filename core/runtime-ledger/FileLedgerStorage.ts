import { ILedgerStorage } from './ILedgerStorage';
import { LedgerEntry } from './LedgerEntry';
import { LedgerStorageResult } from './LedgerStorageResult';
import { LedgerQueryFilter } from './LedgerQueryFilter';
import { LedgerSerializer } from './LedgerSerializer';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * FileLedgerStorage implements audit logs persistence using JSON Lines file append.
 */
export class FileLedgerStorage implements ILedgerStorage {
  private readonly filePath: string;
  private readonly serializer = new LedgerSerializer();

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  private appendQueue: Promise<any> = Promise.resolve();

  public async append(entry: LedgerEntry): Promise<LedgerStorageResult> {
    return new Promise((resolve, reject) => {
      this.appendQueue = this.appendQueue.then(async () => {
        try {
          const dir = path.dirname(this.filePath);
          await fs.mkdir(dir, { recursive: true });
          const serialized = this.serializer.serialize(entry) + '\n';
          await fs.appendFile(this.filePath, serialized, 'utf8');
          resolve({
            success: true,
            entryId: entry.entryId,
            storageType: 'file'
          });
        } catch (err) {
          reject(new Error(`[LEDGER_STORAGE_WRITE_FAILED] Failed write operation: ${(err as Error).message}`));
        }
      });
    });
  }

  public async query(filter?: LedgerQueryFilter): Promise<LedgerEntry[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const lines = data.split('\n');
      const entries: LedgerEntry[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          const entry = this.serializer.deserialize(trimmed);
          if (this.matchesFilter(entry, filter)) {
            entries.push(entry);
          }
        }
      }
      return entries;
    } catch (err) {
      if ((err as any).code === 'ENOENT') {
        return [];
      }
      throw new Error(`[LEDGER_STORAGE_READ_FAILED] Failed read query: ${(err as Error).message}`);
    }
  }

  private matchesFilter(entry: LedgerEntry, filter?: LedgerQueryFilter): boolean {
    if (!filter) {
      return true;
    }
    if (filter.projectId && entry.metadata.projectId !== filter.projectId) {
      return false;
    }
    if (filter.sessionId && entry.metadata.sessionId !== filter.sessionId) {
      return false;
    }
    if (filter.eventType && entry.eventType !== filter.eventType) {
      return false;
    }
    if (filter.source && entry.source !== filter.source) {
      return false;
    }
    return true;
  }
}
