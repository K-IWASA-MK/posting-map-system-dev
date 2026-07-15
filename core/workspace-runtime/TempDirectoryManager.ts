import * as fs from 'fs';
import * as path from 'path';

/**
 * TempDirectoryManager manages the creation and safe teardown cleanup of session tmp directories.
 */
export class TempDirectoryManager {
  /**
   * Creates the temporary directory if not exists.
   * @param tempPath Target temp directory path.
   */
  public create(tempPath: string): void {
    try {
      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }
    } catch (err: any) {
      throw new Error(`TEMP_DIRECTORY_FAILED: Failed to create temp directory. ${err.message}`);
    }
  }

  /**
   * Cleans all content inside the temporary directory.
   * Does not remove the parent directory itself for safety boundaries.
   * @param tempPath Target temp directory path.
   */
  public cleanup(tempPath: string): void {
    try {
      if (fs.existsSync(tempPath)) {
        const files = fs.readdirSync(tempPath);
        for (const file of files) {
          const filePath = path.join(tempPath, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filePath);
          }
        }
      }
    } catch (err: any) {
      throw new Error(`TEMP_DIRECTORY_FAILED: Failed to clean temp directory. ${err.message}`);
    }
  }
}
