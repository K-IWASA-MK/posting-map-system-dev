import { IPlatformTestRunner } from './IPlatformTestRunner';
import { TestResult } from './TestResult';
import { spawnSync } from 'child_process';

/**
 * SimulationTestRunner executes discovered Node.js quality-hook simulation regression tests.
 */
export class SimulationTestRunner implements IPlatformTestRunner {
  public async runTests(testFiles: string[]): Promise<TestResult> {
    const suiteName = 'Simulation Regression Tests';

    if (testFiles.length === 0) {
      return {
        suiteName,
        success: true,
        passedCount: 0,
        failedCount: 0,
        skipped: true,
        errors: []
      };
    }

    let passedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const file of testFiles) {
      const result = spawnSync('node', [file], {
        encoding: 'utf-8',
        stdio: 'inherit'
      });

      if (result.status === 0) {
        passedCount++;
      } else {
        failedCount++;
        errors.push(`Simulation test file failed: ${file} (Exit code: ${result.status})`);
      }
    }

    return {
      suiteName,
      success: failedCount === 0,
      passedCount,
      failedCount,
      skipped: false,
      errors
    };
  }
}
