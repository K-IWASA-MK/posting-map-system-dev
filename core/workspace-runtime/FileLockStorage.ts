import { ILockStorage } from './ILockStorage';
import * as fs from 'fs';

/**
 * FileLockStorage implements ILockStorage on the local filesystem.
 */
export class FileLockStorage implements ILockStorage {
  public exists(lockFilePath: string): boolean {
    return fs.existsSync(lockFilePath);
  }

  public write(lockFilePath: string, content: string): void {
    fs.writeFileSync(lockFilePath, content, 'utf-8');
  }

  public delete(lockFilePath: string): void {
    if (fs.existsSync(lockFilePath)) {
      fs.unlinkSync(lockFilePath);
    }
  }
}
