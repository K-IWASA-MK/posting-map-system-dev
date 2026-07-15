import { IPerformancePolicy, PolicyContext } from '../PerformancePolicy';
import { PerformancePolicyResult } from '../PerformancePolicyResult';

export class Rule002NoLoopWrite implements IPerformancePolicy {
  public get id(): string { return 'RULE-002'; }
  public get name(): string { return 'No Loop Write'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    const loopRegex = /(for\s*\(|while\s*\()[\s\S]{0,300}?\.(updateRange|appendRows|setValue|setValues)\s*\(/;

    if (loopRegex.test(context.sourceCode)) {
      results.push({
        ruleId: this.id,
        ruleName: this.name,
        status: 'FAILED',
        message: 'Spreadsheet write operation (updateRange/appendRows) detected inside a loop. Consolidate data into arrays and write once.',
        targetFile: context.filePath
      });
    }

    return results;
  }
}
