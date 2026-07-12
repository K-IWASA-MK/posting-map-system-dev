import { IPerformancePolicy, PolicyContext } from './PerformancePolicy';
import { PerformancePolicyRegistry } from './PerformancePolicyRegistry';
import { PerformancePolicyReport } from './PerformancePolicyReport';
import { PerformancePolicyResult } from './PerformancePolicyResult';
import * as fs from 'fs';

export class PerformancePolicyEngine {
  private registry: PerformancePolicyRegistry;

  constructor() {
    this.registry = PerformancePolicyRegistry.getInstance();
  }

  public validate(contexts: PolicyContext[]): PerformancePolicyReport {
    const policies = this.registry.getPolicies();
    let allResults: PerformancePolicyResult[] = [];

    for (const policy of policies) {
      for (const context of contexts) {
        const results = policy.validate(context);
        allResults = allResults.concat(results);
      }
    }

    return this.generateReport(policies.length, allResults);
  }

  private generateReport(policyCount: number, results: PerformancePolicyResult[]): PerformancePolicyReport {
    let pass = 0;
    let warning = 0;
    let failed = 0;
    let info = 0;

    const violations: PerformancePolicyResult[] = [];

    for (const res of results) {
      switch (res.status) {
        case 'PASS':
          pass++;
          break;
        case 'WARNING':
          warning++;
          violations.push(res);
          break;
        case 'FAILED':
          failed++;
          violations.push(res);
          break;
        case 'INFO':
          info++;
          violations.push(res);
          break;
      }
    }

    // Default perfect score is 100.
    // Deduct 10 points for each FAILED, 3 points for each WARNING.
    // Minimum score is 0.
    let score = 100 - (failed * 10) - (warning * 3);
    if (score < 0) score = 0;

    return {
      policyCount,
      score,
      pass,
      warning,
      failed,
      info,
      violations
    };
  }

  public exportReportToJson(report: PerformancePolicyReport, outputPath: string): void {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  }
}
