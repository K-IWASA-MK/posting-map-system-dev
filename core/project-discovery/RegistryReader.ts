import * as fs from 'fs';
import * as path from 'path';

/**
 * RegistryReader reads and parses the projects/registry.json file.
 * It is strictly responsible for file reading and JSON parsing only.
 * No validation of schema, directories, or IDs should happen here.
 */
export class RegistryReader {
  /**
   * Reads raw registry object from the file system.
   * @param workspaceRoot Absolute path to the workspace root directory.
   */
  public static readRawRegistry(workspaceRoot: string): any {
    const registryPath = path.join(workspaceRoot, 'projects', 'registry.json');
    
    if (!fs.existsSync(registryPath)) {
      throw new Error(`Registry file does not exist at: ${registryPath}`);
    }

    const fileContent = fs.readFileSync(registryPath, 'utf-8');
    
    try {
      return JSON.parse(fileContent);
    } catch (e: any) {
      throw new Error(`Failed to parse registry JSON: ${e.message}`);
    }
  }
}
