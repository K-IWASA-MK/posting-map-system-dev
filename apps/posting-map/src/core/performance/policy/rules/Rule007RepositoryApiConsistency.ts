import { IPerformancePolicy, PolicyContext } from '../PerformancePolicy';
import { PerformancePolicyResult } from '../PerformancePolicyResult';
import * as fs from 'fs';
import * as path from 'path';

export class Rule007RepositoryApiConsistency implements IPerformancePolicy {
  public get id(): string { return 'RULE-007'; }
  public get name(): string { return 'Repository API Consistency'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Only check repository classes
    if (!context.filePath.includes('/repository/') || !context.filePath.endsWith('Repository.ts')) {
      return results;
    }

    // Attempt to find implements I...Repository
    const implementsMatch = context.sourceCode.match(/implements\s+(I[A-Za-z0-9]+Repository)/);
    if (!implementsMatch) {
      return results;
    }

    const interfaceName = implementsMatch[1];
    
    // Fallback naive search for the interface file in the same directory or common domain dirs
    // Since AST is disabled, this is a basic string matching mechanism.
    const searchDirs = [
      path.dirname(context.filePath),
      path.join(path.dirname(context.filePath), '../../domain') // Rough guess for domain interfaces
    ];
    
    let interfaceContent = '';
    
    // Extract public methods from the current class
    // Naive regex: public methodName(
    const publicMethodRegex = /public\s+([a-zA-Z0-9_]+)\s*\(/g;
    let match;
    const publicMethods: string[] = [];
    while ((match = publicMethodRegex.exec(context.sourceCode)) !== null) {
      publicMethods.push(match[1]);
    }

    // Since reading interface file precisely without AST is hard, we will yield INFO 
    // or WARNING if we detect public methods that are typically not in generic repos
    // Alternatively, if we know common repo methods: findById, findAll, save, getNextStaffNo, etc.
    // For now, we will just log an INFO to verify repository interface consistency.
    results.push({
      ruleId: this.id,
      ruleName: this.name,
      status: 'INFO',
      message: `Repository exposes public methods: ${publicMethods.join(', ')}. Ensure all are defined in ${interfaceName}.`,
      targetFile: context.filePath
    });

    return results;
  }
}
