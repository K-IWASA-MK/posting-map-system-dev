import { IPerformancePolicy, PolicyContext } from '../PerformancePolicy';
import { PerformancePolicyResult } from '../PerformancePolicyResult';

export class Rule008ProfilerMandatory implements IPerformancePolicy {
  public get id(): string { return 'RULE-008'; }
  public get name(): string { return 'Profiler Mandatory'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Only check SpreadsheetRepository implementations
    if (!context.filePath.includes('/repository/') || !context.filePath.includes('Spreadsheet') || !context.filePath.endsWith('Repository.ts')) {
      return results;
    }

    const hasProfilerImport = context.sourceCode.includes('RepositoryPerformanceProfiler');
    const usesProfiler = context.sourceCode.includes('.incrementRepositoryCall(') || context.sourceCode.includes('.recordExecutionTime(');

    if (!hasProfilerImport || !usesProfiler) {
      results.push({
        ruleId: this.id,
        ruleName: this.name,
        status: 'FAILED',
        message: 'SpreadsheetRepository must use RepositoryPerformanceProfiler to record metrics.',
        targetFile: context.filePath
      });
    } else {
        results.push({
            ruleId: this.id,
            ruleName: this.name,
            status: 'PASS',
            message: 'Profiler is correctly utilized in this repository.',
            targetFile: context.filePath
        });
    }

    return results;
  }
}
