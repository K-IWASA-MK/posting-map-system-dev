/**
 * ILockStorage abstracts file/db lock persistent actions to support decouple from file system.
 */
export interface ILockStorage {
  exists(lockFilePath: string): boolean;
  write(lockFilePath: string, content: string): void;
  delete(lockFilePath: string): void;
}
