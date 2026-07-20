import { TestDiscovery } from './TestDiscovery';
import { TestPolicy } from './TestPolicy';
import { TypeScriptTestRunner } from './TypeScriptTestRunner';
import { PythonTestRunner } from './PythonTestRunner';
import { SimulationTestRunner } from './SimulationTestRunner';
import { TestResult } from './TestResult';
import { StrategyResolver } from './StrategyResolver';
import { TestDiscoveryService } from './TestDiscoveryService';
import { RegistryValidator } from './RegistryValidator';
import { ExecutionPlanner, PlanOptions } from './ExecutionPlanner';
import { ExecutionPlan } from './ExecutionPlan';
import { ExecutionDependencyGraph } from './ExecutionDependencyGraph';
import { DependencyValidator } from './DependencyValidator';
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

    // 1. Run Test Discovery via Discovery Service
    console.log('[Test Runner] Scanning for tests and loading registry...');
    const discoveryService = new TestDiscoveryService();
    const assets = await discoveryService.discover(workspaceRoot);

    // 2. Validate Discovery Integrity
    const registryValidationReport = RegistryValidator.validate(assets, workspaceRoot);

    // Build Dependency Graph and Validate
    const graph = new ExecutionDependencyGraph(assets);
    const depValidationReport = DependencyValidator.validate(graph);

    const isValid = registryValidationReport.isValid && depValidationReport.isValid;

    // Print Discovery Report
    const registeredCount = assets.filter(a => !a.isLegacy).length;
    const legacyCount = assets.filter(a => a.isLegacy).length;
    const disabledCount = assets.filter(a => !a.enabled).length;

    console.log('\n==================================================');
    console.log('              TEST DISCOVERY REPORT               ');
    console.log('==================================================');
    console.log(`Total Assets Discovered : ${assets.length}`);
    console.log(`  - Registered Standard : ${registeredCount}`);
    console.log(`  - Virtual Legacy      : ${legacyCount}`);
    console.log(`Disabled Assets          : ${disabledCount}`);
    console.log(`Validation Status       : ${isValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log('--------------------------------------------------');

    if (registryValidationReport.warnings.length > 0) {
      console.log('Warnings:');
      for (const warn of registryValidationReport.warnings) {
        console.log(`  ⚠️  ${warn}`);
      }
      console.log('--------------------------------------------------');
    }

    if (!isValid) {
      console.error('Validation Errors:');
      for (const err of registryValidationReport.errors) {
        console.error(`  ❌ Registry: ${err}`);
      }
      for (const err of depValidationReport.errors) {
        console.error(`  ❌ Dependency: ${err}`);
      }
      console.error('==================================================');
      console.error('[Test Runner] Validation Failed. Exiting.');
      process.exit(1);
    }

    // 3. Parse command line filtering options
    const tags: string[] = [];
    let category: string | undefined;
    const capabilities: string[] = [];

    for (const arg of process.argv) {
      if (arg.startsWith('--tag=')) {
        tags.push(...arg.split('=')[1]?.split(',').map(s => s.trim()) || []);
      }
      if (arg.startsWith('--category=')) {
        category = arg.split('=')[1]?.trim();
      }
      if (arg.startsWith('--capability=')) {
        capabilities.push(...arg.split('=')[1]?.split(',').map(s => s.trim()) || []);
      }
    }

    const plannerOptions: PlanOptions = {
      tags: tags.length > 0 ? tags : undefined,
      category,
      capabilities: capabilities.length > 0 ? capabilities : undefined,
      enabledOnly: true
    };

    // 4. Generate Execution Plan
    const plan = ExecutionPlanner.plan(assets, plannerOptions);
    console.log(`[Test Runner] Generated Execution Plan with ${plan.entries.length} planned entries.`);

    // 5. Partition plan to delegate to individual runners
    const tsPlanEntries = plan.entries.filter(e => e.asset.module.endsWith('.ts'));
    const pyFiles = plan.entries.filter(e => e.asset.module.endsWith('.py')).map(e => path.resolve(workspaceRoot, e.asset.module));
    const simFiles = plan.entries.filter(e => e.asset.module.endsWith('RegressionTest.js') || e.asset.module.endsWith('.js')).map(e => path.resolve(workspaceRoot, e.asset.module));

    // 6. Initiate Executions via Individual Runners
    const strategy = StrategyResolver.resolve(process.argv, process.env);
    const tsRunner = new TypeScriptTestRunner(strategy);
    const pyRunner = new PythonTestRunner(workspaceRoot);
    const simRunner = new SimulationTestRunner();

    const results: TestResult[] = [];

    if (tsPlanEntries.length > 0) {
      console.log('\n[Test Runner] Running TypeScript Test Suite...');
      const tsPlan: ExecutionPlan = { entries: tsPlanEntries };
      const tsResult = await tsRunner.runTests(tsPlan);
      results.push(tsResult);
    } else {
      console.log('\n[Test Runner] TypeScript Test Suite: SKIPPED (No planned tests)');
    }

    if (pyFiles.length > 0) {
      console.log('\n[Test Runner] Running Python Test Suite...');
      const pyResult = await pyRunner.runTests(pyFiles);
      results.push(pyResult);
    } else {
      console.log('\n[Test Runner] Python Test Suite: SKIPPED (No planned tests)');
    }

    if (simFiles.length > 0) {
      console.log('\n[Test Runner] Running Simulation Test Suite...');
      const simResult = await simRunner.runTests(simFiles);
      results.push(simResult);
    } else {
      console.log('\n[Test Runner] Simulation Test Suite: SKIPPED (No planned tests)');
    }

    // 7. Evaluate Outcome Policy
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
