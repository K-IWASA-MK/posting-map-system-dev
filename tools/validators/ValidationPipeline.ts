import { IValidator, ValidationReport, ValidationResult } from './types';
import { DependencyScanner } from './DependencyScanner';
import { ImportRuleChecker } from './ImportRuleChecker';
import { ArchitectureValidator } from './ArchitectureValidator';
import { SDKBoundaryValidator } from './SDKBoundaryValidator';
import { DomainIsolationValidator } from './DomainIsolationValidator';
import { NamingValidator } from './NamingValidator';

export class ValidationPipeline {
  private readonly validators: IValidator[] = [];

  constructor() {
    // Sequence requirements: Dependency -> Import -> Architecture -> SDK -> Domain -> Naming
    this.validators.push(new DependencyScanner());
    this.validators.push(new ImportRuleChecker());
    this.validators.push(new ArchitectureValidator());
    this.validators.push(new SDKBoundaryValidator());
    this.validators.push(new DomainIsolationValidator());
    this.validators.push(new NamingValidator());
  }

  public async run(): Promise<ValidationReport> {
    const startTime = Date.now();
    const results: ValidationResult[] = [];
    
    let total = 0;
    let passed = 0;
    let warnings = 0;
    let failed = 0;

    for (const validator of this.validators) {
      const result = await validator.validate();
      results.push(result);
      
      total++;
      if (result.status === 'PASS') {
        passed++;
      } else if (result.status === 'WARNING') {
        warnings++;
      } else if (result.status === 'FAIL') {
        failed++;
      }
    }

    let overallStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
    if (failed > 0) {
      overallStatus = 'FAIL';
    } else if (warnings > 0) {
      overallStatus = 'WARNING';
    }

    return {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total,
        passed,
        warnings,
        failed
      },
      totalDuration: Date.now() - startTime,
      overallStatus
    };
  }
}
