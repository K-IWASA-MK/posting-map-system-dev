import { TestAsset } from './TestAsset';
import { REGISTERED_TESTS } from './TestRegistry';
import { TestDiscovery } from './TestDiscovery';
import * as path from 'path';

export interface ITestDiscovery {
  discover(workspaceRoot: string): Promise<TestAsset[]>;
}

export class TestDiscoveryService implements ITestDiscovery {
  /**
   * Scans the workspace, merges standard registered tests and dynamic legacy tests.
   */
  public async discover(workspaceRoot: string): Promise<TestAsset[]> {
    const assets: TestAsset[] = [];

    // 1. Load standard registered tests
    const registeredMap = new Map<string, TestAsset>();
    for (const test of REGISTERED_TESTS) {
      // Normalize module paths (relative to workspace root)
      const normalizedPath = path.normalize(test.module).replace(/\\/g, '/');
      const normalizedTest = {
        ...test,
        module: normalizedPath
      };
      assets.push(normalizedTest);
      registeredMap.set(normalizedPath, normalizedTest);
    }

    // 2. Discover all physical test files in workspace
    const tsFiles = TestDiscovery.discoverTypeScriptTests(workspaceRoot);
    const pyFiles = TestDiscovery.discoverPythonTests(workspaceRoot);
    const simFiles = TestDiscovery.discoverSimulationTests(workspaceRoot);

    const allPhysicalFiles = [...tsFiles, ...pyFiles, ...simFiles];

    // 3. Detect legacy (unregistered) physical tests
    for (const file of allPhysicalFiles) {
      const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');

      // If the file is not registered, create a Virtual Legacy TestAsset
      if (!registeredMap.has(relativePath)) {
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        const id = `legacy-${baseName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()}`;

        assets.push({
          id,
          version: 1,
          name: `Legacy: ${path.basename(file)}`,
          module: relativePath,
          category: ext === '.py' ? 'python' : (ext === '.js' ? 'simulation' : 'legacy'),
          tags: [ext.slice(1), 'legacy'],
          capabilities: ['requiresFreshProcess'], // Force sequential process separation
          timeout: 60000,
          enabled: true,
          isLegacy: true
        });
      }
    }

    return assets;
  }
}
