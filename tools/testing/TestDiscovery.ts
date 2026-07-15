import * as fs from 'fs';
import * as path from 'path';

/**
 * TestDiscovery scans directories and locates test files for each test suite category.
 * It is strictly read-only and does not launch or execute tests.
 */
export class TestDiscovery {
  /**
   * Scans for TypeScript unit and integration test files.
   * @param workspaceRoot Absolute path to the workspace root.
   */
  public static discoverTypeScriptTests(workspaceRoot: string): string[] {
    const tsDirs = [
      path.join(workspaceRoot, 'tests', 'unit', 'typescript'),
      path.join(workspaceRoot, 'projects', 'posting-map', 'tests', 'unit', 'typescript'),
      path.join(workspaceRoot, 'tests', 'integration'),
      path.join(workspaceRoot, 'projects', 'posting-map', 'tests', 'integration')
    ];
    const files: string[] = [];
    for (const dir of tsDirs) {
      if (fs.existsSync(dir)) {
        this.scanRecursively(dir, ['.ts'], files);
      }
    }
    return files;
  }

  /**
   * Scans for Python unit test files.
   * @param workspaceRoot Absolute path to the workspace root.
   */
  public static discoverPythonTests(workspaceRoot: string): string[] {
    const pyDirs = [
      path.join(workspaceRoot, 'tests', 'unit', 'python'),
      path.join(workspaceRoot, 'projects', 'posting-map', 'tests', 'unit', 'python')
    ];
    const files: string[] = [];
    for (const dir of pyDirs) {
      if (fs.existsSync(dir)) {
        this.scanRecursively(dir, ['.py'], files);
      }
    }
    return files;
  }

  /**
   * Scans for Node.js-based Regression Simulation test files.
   * @param workspaceRoot Absolute path to the workspace root.
   */
  public static discoverSimulationTests(workspaceRoot: string): string[] {
    const simDir = path.join(workspaceRoot, 'tests', 'simulation');
    const files: string[] = [];
    if (fs.existsSync(simDir)) {
      const items = fs.readdirSync(simDir);
      for (const item of items) {
        const fullPath = path.join(simDir, item);
        if (fs.statSync(fullPath).isFile() && item.endsWith('RegressionTest.js')) {
          files.push(fullPath);
        }
      }
    }
    return files;
  }

  private static scanRecursively(dir: string, extensions: string[], fileList: string[]): void {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        this.scanRecursively(fullPath, extensions, fileList);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext) && !item.startsWith('.')) {
          fileList.push(fullPath);
        }
      }
    }
  }
}
