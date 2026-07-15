import { IPlatformTestRunner } from './IPlatformTestRunner';
import { TestResult } from './TestResult';
import { spawnSync } from 'child_process';

/**
 * TypeScriptTestRunner executes discovered TS unit and integration tests.
 */
export class TypeScriptTestRunner implements IPlatformTestRunner {
  public async runTests(testFiles: string[]): Promise<TestResult> {
    const suiteName = 'TypeScript Unit & Integration Tests';
    
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
      const result = spawnSync('npx', ['ts-node', '-r', 'tsconfig-paths/register', file], {
        encoding: 'utf-8',
        stdio: 'inherit'
      });

      if (result.status === 0) {
        passedCount++;
      } else {
        failedCount++;
        errors.push(`TypeScript test file failed: ${file} (Exit code: ${result.status})`);
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
