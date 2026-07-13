import { IPerformancePolicy, PolicyContext } from '../PerformancePolicy';
import { PerformancePolicyResult } from '../PerformancePolicyResult';

export class Rule005SpreadsheetAccess implements IPerformancePolicy {
  public get id(): string { return 'RULE-005'; }
  public get name(): string { return 'Spreadsheet Access Restrict'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Check if Spreadsheet is being used without going through SpreadsheetReader/Writer or Repository
    const isGasOrSpreadsheet = context.sourceCode.includes('SpreadsheetApp.');
    const isInfrastructure = context.filePath.includes('/infrastructure/');
    
    if (isGasOrSpreadsheet && !isInfrastructure) {
      results.push({
        ruleId: this.id,
        ruleName: this.name,
        status: 'FAILED',
        message: 'Spreadsheet usage must be encapsulated within the Infrastructure/Repository layer.',
        targetFile: context.filePath
      });
    }

    return results;
  }
}
