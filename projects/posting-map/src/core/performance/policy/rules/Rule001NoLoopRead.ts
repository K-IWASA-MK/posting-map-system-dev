import { IPerformancePolicy, PolicyContext } from '../PerformancePolicy';
import { PerformancePolicyResult } from '../PerformancePolicyResult';

export class Rule001NoLoopRead implements IPerformancePolicy {
  public get id(): string { return 'RULE-001'; }
  public get name(): string { return 'No Loop Read'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Very basic static check using regex
    // Looks for `for ` or `while ` followed eventually by `.readAll` or `.readRange` within a rough block.
    // This is a naive check since AST is not allowed for now.
    const loopRegex = /(for\s*\(|while\s*\()[\s\S]{0,200}?\.(readAll|readRange)\s*\(/;

    if (loopRegex.test(context.sourceCode)) {
      results.push({
        ruleId: this.id,
        ruleName: this.name,
        status: 'FAILED',
        message: 'Spreadsheet read operation (readAll/readRange) detected inside a loop. This causes severe performance degradation.',
        targetFile: context.filePath
      });
    }

    return results;
  }
}
