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
import { PerformanceValidationExporter } from './src/core/performance/validation/PerformanceValidationExporter';

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

// 2. Initialize Runner
const runner = new PerformanceValidationRunner();
const srcDirectory = path.join(__dirname, 'src');

// 3. Run Validation
const result = runner.run(srcDirectory);

// 4. Export Results
const exporter = new PerformanceValidationExporter();
const outputPath = path.join(__dirname, 'PerformanceValidationResult.json');

exporter.exportToConsole(result);
exporter.exportToJson(result, outputPath);

// If validation fails, exit with error code (useful for CI)
if (result.summary.status === 'FAILED') {
    process.exit(1);
}
