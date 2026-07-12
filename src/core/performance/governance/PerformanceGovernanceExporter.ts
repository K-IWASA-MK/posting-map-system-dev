import { PerformanceGovernanceResult } from './PerformanceGovernanceResult';
import { PerformanceGovernanceReport } from './PerformanceGovernanceReport';
import * as fs from 'fs';

export class PerformanceGovernanceExporter {
  public exportToJson(result: PerformanceGovernanceResult, outputPath: string): void {
    const jsonString = JSON.stringify(result, null, 2);
    fs.writeFileSync(outputPath, jsonString, 'utf-8');
    console.log(`[Governance Exporter] JSON report written to: ${outputPath}`);
  }

  public exportToConsole(result: PerformanceGovernanceResult): void {
    const { decision, validationResult } = result;
    const { summary, report } = validationResult;

    // Build the report format
    const governanceReport: PerformanceGovernanceReport = {
      overallStatus: decision.status,
      action: decision.action,
      score: decision.score,
      recommendation: decision.recommendation,
      violations: report.violations,
      generatedAt: decision.generatedAt
    };

    console.log('\n==================================================');
    console.log('       PERFORMANCE GOVERNANCE DECISION');
    console.log('==================================================');
    console.log(`STATUS         : ${governanceReport.overallStatus}`);
    console.log(`ACTION         : ${governanceReport.action}`);
    console.log(`SCORE          : ${governanceReport.score} / 100`);
    console.log(`RECOMMENDATION : ${governanceReport.recommendation}`);
    console.log(`GENERATED AT   : ${governanceReport.generatedAt}`);
    console.log('--------------------------------------------------');
    console.log(`[Validation Stats] PASS: ${summary.passed} | INFO: ${summary.info} | WARNING: ${summary.warning} | FAILED: ${summary.failed}`);
    console.log('==================================================\n');

    if (governanceReport.violations && governanceReport.violations.length > 0) {
      console.log('Violations:');
      governanceReport.violations.forEach(v => {
        console.log(`  [${v.status}] ${v.ruleId} (${v.ruleName})`);
        console.log(`    File   : ${v.targetFile}`);
        console.log(`    Message: ${v.message}`);
        console.log('');
      });
      console.log('==================================================\n');
    }
  }
}
