/**
 * LedgerStorageResult describes output metadata from appending records.
 */
export interface LedgerStorageResult {
  readonly success: boolean;
  readonly entryId: string;
  readonly storageType: string;
}
