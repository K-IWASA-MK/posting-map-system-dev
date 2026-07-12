import * as fs from 'fs';
import * as path from 'path';
import { PerformancePolicyEngine } from './src/core/performance/policy/PerformancePolicyEngine';
import { PerformancePolicyRegistry } from './src/core/performance/policy/PerformancePolicyRegistry';
import { PolicyContext } from './src/core/performance/policy/PerformancePolicy';
import { Rule001NoLoopRead } from './src/core/performance/policy/rules/Rule001NoLoopRead';
import { Rule002NoLoopWrite } from './src/core/performance/policy/rules/Rule002NoLoopWrite';
import { Rule003RepositoryIsolation } from './src/core/performance/policy/rules/Rule003RepositoryIsolation';
import { Rule004ApplicationSpreadsheetBan } from './src/core/performance/policy/rules/Rule004ApplicationSpreadsheetBan';
import { Rule005SpreadsheetAccess } from './src/core/performance/policy/rules/Rule005SpreadsheetAccess';
import { Rule006MemoryProcessing } from './src/core/performance/policy/rules/Rule006MemoryProcessing';
import { Rule007RepositoryApiConsistency } from './src/core/performance/policy/rules/Rule007RepositoryApiConsistency';
import { Rule008ProfilerMandatory } from './src/core/performance/policy/rules/Rule008ProfilerMandatory';

// Setup Registry
const registry = PerformancePolicyRegistry.getInstance();
registry.register(new Rule001NoLoopRead());
registry.register(new Rule002NoLoopWrite());
registry.register(new Rule003RepositoryIsolation());
registry.register(new Rule004ApplicationSpreadsheetBan());
registry.register(new Rule005SpreadsheetAccess());
registry.register(new Rule006MemoryProcessing());
registry.register(new Rule007RepositoryApiConsistency());
registry.register(new Rule008ProfilerMandatory());

// Gather files
const contexts: PolicyContext[] = [];

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') && !fullPath.includes('.test.ts')) {
      const sourceCode = fs.readFileSync(fullPath, 'utf8');
      contexts.push({ filePath: fullPath, sourceCode });
    }
  }
}

walkDir(path.join(__dirname, 'src'));

// Execute Engine
const engine = new PerformancePolicyEngine();
const report = engine.validate(contexts);

// Output
const outputPath = path.join(__dirname, 'PerformancePolicyReport.json');
engine.exportReportToJson(report, outputPath);

console.log(`Performance Policy Validation Complete.`);
console.log(`Score: ${report.score} / 100`);
console.log(`Pass: ${report.pass}, Warning: ${report.warning}, Failed: ${report.failed}, Info: ${report.info}`);
console.log(`Report written to ${outputPath}`);
