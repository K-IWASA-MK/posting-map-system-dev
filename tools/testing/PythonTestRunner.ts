import { IPlatformTestRunner } from './IPlatformTestRunner';
import { TestResult } from './TestResult';
import { TestEnvironment } from './TestEnvironment';
import { spawnSync } from 'child_process';

/**
 * PythonTestRunner executes discovered Python unit tests.
 * Decouples execution from hardcoded pytest paths by discovering the Python interpreter.
 */
export class PythonTestRunner implements IPlatformTestRunner {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  public async runTests(testFiles: string[]): Promise<TestResult> {
    const suiteName = 'Python Unit Tests';

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

    const pyCommandArgs = TestEnvironment.discoverPythonCommand(this.workspaceRoot);
    const pythonCmd = pyCommandArgs[0];
    const baseArgs = pyCommandArgs.slice(1);

    // Call python -m pytest [file1] [file2] ...
    const pytestArgs = [...baseArgs, '-m', 'pytest', ...testFiles];

    const result = spawnSync(pythonCmd, pytestArgs, {
      encoding: 'utf-8',
      stdio: 'inherit',
      env: {
        ...process.env,
        PYTHONPATH: `.:transformation:${process.env.PYTHONPATH || ''}`
      }
    });

    const success = result.status === 0;
    const errors: string[] = [];
    if (!success) {
      errors.push(`pytest execution failed (Exit code: ${result.status})`);
    }

    return {
      suiteName,
      success,
      passedCount: success ? testFiles.length : 0,
      failedCount: success ? 0 : testFiles.length,
      skipped: false,
      errors
    };
  }
}
