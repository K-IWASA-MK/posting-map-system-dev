import { IPerformancePolicy, PolicyContext } from '../PerformancePolicy';
import { PerformancePolicyResult } from '../PerformancePolicyResult';

export class Rule003RepositoryIsolation implements IPerformancePolicy {
  public get id(): string { return 'RULE-003'; }
  public get name(): string { return 'Repository Isolation'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Check if non-repository code is trying to import SpreadsheetReader/Writer
    const isRepositoryFolder = context.filePath.includes('/repository/');
    const isInfrastructureFolder = context.filePath.includes('/infrastructure/');
    
    if (!isRepositoryFolder && !isInfrastructureFolder) {
      if (context.sourceCode.includes('SpreadsheetReader') || context.sourceCode.includes('SpreadsheetWriter')) {
        results.push({
          ruleId: this.id,
          ruleName: this.name,
          status: 'FAILED',
          message: 'SpreadsheetReader/Writer must only be used within the Repository or Infrastructure layer.',
          targetFile: context.filePath
        });
      }
    }

    return results;
  }
}
