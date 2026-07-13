import { PerformanceValidationResult } from './PerformanceValidationResult';
import * as fs from 'fs';

export class PerformanceValidationExporter {
  public exportToJson(result: PerformanceValidationResult, outputPath: string): void {
    const jsonString = JSON.stringify(result, null, 2);
    fs.writeFileSync(outputPath, jsonString, 'utf-8');
    console.log(`[Validation Exporter] JSON report written to: ${outputPath}`);
  }

  public exportToConsole(result: PerformanceValidationResult): void {
    const summary = result.summary;
    console.log('\n==================================================');
    console.log('       PERFORMANCE VALIDATION REPORT');
    console.log('==================================================');
    console.log(`Status        : ${summary.status}`);
    console.log(`Score         : ${summary.score} / 100`);
    console.log(`Policies      : ${summary.validationCount}`);
    console.log(`Duration      : ${summary.durationMs} ms`);
    console.log(`Generated At  : ${summary.generatedAt}`);
    console.log('--------------------------------------------------');
    console.log(`PASS: ${summary.passed} | INFO: ${summary.info} | WARNING: ${summary.warning} | FAILED: ${summary.failed}`);
    console.log('==================================================\n');

    if (result.report.violations && result.report.violations.length > 0) {
      console.log('Violations:');
      result.report.violations.forEach(v => {
        console.log(`  [${v.status}] ${v.ruleId} (${v.ruleName})`);
        console.log(`    File   : ${v.targetFile}`);
        console.log(`    Message: ${v.message}`);
        console.log('');
      });
      console.log('==================================================\n');
    }
  }
}
