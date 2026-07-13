import { IPerformancePolicy, PolicyContext } from '../PerformancePolicy';
import { PerformancePolicyResult } from '../PerformancePolicyResult';

export class Rule006MemoryProcessing implements IPerformancePolicy {
  public get id(): string { return 'RULE-006'; }
  public get name(): string { return 'Memory Processing Required'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // If it's a Repository and it reads data, we expect to see Map, array functions, etc.
    const isRepository = context.filePath.includes('/repository/') && context.filePath.endsWith('Repository.ts');
    
    if (isRepository && context.sourceCode.includes('readAll(')) {
      const hasMemoryProcessing = context.sourceCode.includes('new Map') || 
                                  context.sourceCode.includes('.filter(') ||
                                  context.sourceCode.includes('.find(') ||
                                  context.sourceCode.includes('.reduce(');
                                  
      if (!hasMemoryProcessing) {
        results.push({
          ruleId: this.id,
          ruleName: this.name,
          status: 'WARNING',
          message: 'Repository uses readAll but lacks standard memory processing patterns (Map/filter/reduce). Ensure operations are done in-memory.',
          targetFile: context.filePath
        });
      }
      
      if (context.metrics && context.metrics.totalExecutionTimeMs > 0) {
          const reads = context.metrics.sheetMetrics.reduce((acc, m) => acc + m.readCount, 0);
          if (reads > 10) {
              results.push({
                ruleId: this.id,
                ruleName: this.name,
                status: 'INFO',
                message: `Repository performed ${reads} spreadsheet reads during this context. Optimization candidate for data consolidation.`,
                targetFile: context.filePath
              });
          }
      }
    }

    return results;
  }
}
