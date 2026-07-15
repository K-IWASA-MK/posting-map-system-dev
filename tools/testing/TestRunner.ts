import { TestDiscovery } from './TestDiscovery';
import { TestPolicy } from './TestPolicy';
import { TypeScriptTestRunner } from './TypeScriptTestRunner';
import { PythonTestRunner } from './PythonTestRunner';
import { SimulationTestRunner } from './SimulationTestRunner';
import { TestResult } from './TestResult';
import * as path from 'path';

/**
 * TestRunner is the central orchestrator for the AIOS Platform test gate.
 * Conforms to: TestRunner Never Executes, Never Detects, Never Judges.
 */
export class TestRunner {
  public static async main() {
    console.log('==================================================');
    console.log('            AIOS PLATFORM TEST RUNNER             ');
    console.log('==================================================');

    const workspaceRoot = path.resolve(__dirname, '../..');

    // 1. Run Test Discovery (Separated logic)
    console.log('[Test Runner] Scanning for tests...');
    const tsFiles = TestDiscovery.discoverTypeScriptTests(workspaceRoot);
    const pyFiles = TestDiscovery.discoverPythonTests(workspaceRoot);
    const simFiles = TestDiscovery.discoverSimulationTests(workspaceRoot);

    console.log(`[Test Runner] Discovered:`);
    console.log(`  - TypeScript: ${tsFiles.length} files`);
    console.log(`  - Python:     ${pyFiles.length} files`);
    console.log(`  - Simulation: ${simFiles.length} files`);
    console.log('--------------------------------------------------');

    // 2. Initiate Executions via Individual Runners
    const tsRunner = new TypeScriptTestRunner();
    const pyRunner = new PythonTestRunner(workspaceRoot);
    const simRunner = new SimulationTestRunner();

    const results: TestResult[] = [];

    console.log('\n[Test Runner] Running TypeScript Test Suite...');
    const tsResult = await tsRunner.runTests(tsFiles);
    results.push(tsResult);

    console.log('\n[Test Runner] Running Python Test Suite...');
    const pyResult = await pyRunner.runTests(pyFiles);
    results.push(pyResult);

    console.log('\n[Test Runner] Running Simulation Test Suite...');
    const simResult = await simRunner.runTests(simFiles);
    results.push(simResult);

    // 3. Evaluate Outcome Policy (Separated logic)
    const summary = TestPolicy.evaluateSummary(results);

    // 4. Output Consolidated Summary Report
    console.log('\n==================================================');
    console.log('               TEST EXECUTION SUMMARY             ');
    console.log('==================================================');
    console.log(`Overall Decision: ${summary.decision}`);
    console.log(`Total Suites    : ${summary.totalSuiteCount}`);
    console.log(`Total Passed    : ${summary.totalPassed}`);
    console.log(`Total Failed    : ${summary.totalFailed}`);
    console.log('--------------------------------------------------');
    
    for (const res of summary.results) {
      const status = res.skipped ? 'SKIPPED' : (res.success ? 'PASS' : 'FAIL');
      console.log(`[${status}] ${res.suiteName}`);
      if (res.errors.length > 0) {
        for (const err of res.errors) {
          console.log(`  - Error: ${err}`);
        }
      }
    }
    console.log('==================================================');

    if (!summary.success) {
      console.error('[Test Runner] Quality Gate Failed. Exiting with error.');
      process.exit(1);
    } else {
      console.log('[Test Runner] Quality Gate Passed. Exiting successfully.');
      process.exit(0);
    }
  }
}

if (require.main === module) {
  TestRunner.main().catch(err => {
    console.error('[Fatal Error in Test Runner]', err);
    process.exit(1);
  });
}
