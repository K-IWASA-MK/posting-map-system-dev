import * as path from 'path';
import { PerformancePolicyRegistry } from './src/core/performance/policy/PerformancePolicyRegistry';
import { Rule001NoLoopRead } from './src/core/performance/policy/rules/Rule001NoLoopRead';
import { Rule002NoLoopWrite } from './src/core/performance/policy/rules/Rule002NoLoopWrite';
import { Rule003RepositoryIsolation } from './src/core/performance/policy/rules/Rule003RepositoryIsolation';
import { Rule004ApplicationSpreadsheetBan } from './src/core/performance/policy/rules/Rule004ApplicationSpreadsheetBan';
import { Rule005SpreadsheetAccess } from './src/core/performance/policy/rules/Rule005SpreadsheetAccess';
import { Rule006MemoryProcessing } from './src/core/performance/policy/rules/Rule006MemoryProcessing';
import { Rule007RepositoryApiConsistency } from './src/core/performance/policy/rules/Rule007RepositoryApiConsistency';
import { Rule008ProfilerMandatory } from './src/core/performance/policy/rules/Rule008ProfilerMandatory';
import { PerformanceValidationRunner } from './src/core/performance/validation/PerformanceValidationRunner';
import { PerformanceGovernanceEngine } from './src/core/performance/governance/PerformanceGovernanceEngine';
import { PerformanceGovernanceExporter } from './src/core/performance/governance/PerformanceGovernanceExporter';
import { PerformanceGovernanceAction } from './src/core/performance/governance/PerformanceGovernanceDecision';

// 1. Setup Registry
const registry = PerformancePolicyRegistry.getInstance();
registry.register(new Rule001NoLoopRead());
registry.register(new Rule002NoLoopWrite());
registry.register(new Rule003RepositoryIsolation());
registry.register(new Rule004ApplicationSpreadsheetBan());
registry.register(new Rule005SpreadsheetAccess());
registry.register(new Rule006MemoryProcessing());
registry.register(new Rule007RepositoryApiConsistency());
registry.register(new Rule008ProfilerMandatory());

// 2. Initialize Runner & Run Validation
const runner = new PerformanceValidationRunner();
const srcDirectory = path.join(__dirname, 'src');
const validationResult = runner.run(srcDirectory);

// 3. Initialize Governance & Evaluate
const governanceEngine = new PerformanceGovernanceEngine();
const governanceResult = governanceEngine.evaluate(validationResult);

// 4. Export Results
const exporter = new PerformanceGovernanceExporter();
const outputPath = path.join(__dirname, 'PerformanceGovernanceResult.json');

exporter.exportToConsole(governanceResult);
exporter.exportToJson(governanceResult, outputPath);

// 5. Exit based on Governance Action (useful for CI)
// Although not strictly enforcing BLOCK in S6-6, we exit with error code if BLOCK is decided
// so the process correctly reflects the governance status.
if (governanceResult.decision.action === PerformanceGovernanceAction.BLOCK) {
    process.exit(1);
}
