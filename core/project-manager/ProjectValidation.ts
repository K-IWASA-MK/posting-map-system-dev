import * as fs from 'fs';
import * as path from 'path';
import { ValidationResult } from './ProjectMetadata';

/**
 * ProjectValidation performs purely read-only filesystem validation.
 * Checks for file presence without reading, parsing, or executing them.
 */
export class ProjectValidation {
  private static readonly REQUIRED_FILES = ['package.json', 'manifest.json', 'README.md'];

  /**
   * Asserts the presence of mandatory files inside the project path.
   * @param projectPath Absolute path to the project workspace.
   */
  public static validateFilesystem(projectPath: string): ValidationResult {
    const missingFiles: string[] = [];

    for (const file of this.REQUIRED_FILES) {
      const filePath = path.join(projectPath, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }

    return {
      valid: missingFiles.length === 0,
      missingFiles
    };
  }
}
