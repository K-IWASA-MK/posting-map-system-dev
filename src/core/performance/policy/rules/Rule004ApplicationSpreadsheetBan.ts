import { IPerformancePolicy, PolicyContext } from '../PerformancePolicy';
import { PerformancePolicyResult } from '../PerformancePolicyResult';

export class Rule004ApplicationSpreadsheetBan implements IPerformancePolicy {
  public get id(): string { return 'RULE-004'; }
  public get name(): string { return 'Application Spreadsheet Ban'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Check if Application layer files directly access SpreadsheetApp
    const isApplicationFolder = context.filePath.includes('/application/');
    
    if (isApplicationFolder) {
      if (context.sourceCode.includes('SpreadsheetApp.') || context.sourceCode.includes('SpreadsheetApp(')) {
        results.push({
          ruleId: this.id,
          ruleName: this.name,
          status: 'FAILED',
          message: 'Direct usage of SpreadsheetApp is prohibited in the Application layer. Use Repository interfaces.',
          targetFile: context.filePath
        });
      }
    }

    return results;
  }
}
