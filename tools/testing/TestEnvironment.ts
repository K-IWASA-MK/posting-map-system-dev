import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * TestEnvironment discovers environmental factors (like Python interpreters)
 * to decouple test suites from hardcoded binary shebangs.
 */
export class TestEnvironment {
  /**
   * Finds the best python executable command sequence dynamically.
   * Checks venv -> uv -> poetry -> system python3 in order.
   * @param workspaceRoot Absolute path to the workspace root.
   */
  public static discoverPythonCommand(workspaceRoot: string): string[] {
    // 1. Check local venv python paths
    const venvPaths = [
      path.join(workspaceRoot, '.venv', 'bin', 'python'),
      path.join(workspaceRoot, '.venv', 'bin', 'python3'),
      path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe') // Windows fallback
    ];

    for (const venvPath of venvPaths) {
      if (fs.existsSync(venvPath)) {
        return [venvPath];
      }
    }

    // 2. Check uv
    if (this.commandExists('uv')) {
      return ['uv', 'run', 'python'];
    }

    // 3. Check poetry
    if (this.commandExists('poetry')) {
      return ['poetry', 'run', 'python'];
    }

    // 4. Check system python3
    if (this.commandExists('python3')) {
      return ['python3'];
    }

    return ['python'];
  }

  private static commandExists(cmd: string): boolean {
    try {
      const checkCmd = process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`;
      execSync(checkCmd, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}
