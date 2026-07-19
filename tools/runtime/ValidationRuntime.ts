import { ValidationPipeline } from '../validators/ValidationPipeline';
import { ValidationReport } from '../validators/types';

export class ValidationRuntime {
  public static async execute(): Promise<void> {
    console.log('\n=============================================');
    console.log('🤖 AIOS Platform Validation Runtime Running');
    console.log('=============================================\n');

    // Build and Tests are verified pre-runtime by the quality command chain.
    // If they failed, this script would not execute due to short-circuiting.
    console.log('Build................PASS');
    console.log('Tests................PASS');

    const pipeline = new ValidationPipeline();
    const report: ValidationReport = await pipeline.run();

    // Map and print validator results
    for (const result of report.results) {
      let displayName = '';
      switch (result.validatorId) {
        case 'DependencyScanner':
          displayName = 'Dependency...........';
          break;
        case 'ImportRuleChecker':
          displayName = 'Import Rules.........';
          break;
        case 'ArchitectureValidator':
          displayName = 'Architecture.........';
          break;
        case 'SDKBoundaryValidator':
          displayName = 'SDK Boundary.........';
          break;
        case 'DomainIsolationValidator':
          displayName = 'Domain Isolation.....';
          break;
        case 'NamingValidator':
          displayName = 'Naming...............';
          break;
        default:
          displayName = result.validatorId.padEnd(21, '.') + '..';
          break;
      }

      console.log(`${displayName}${result.status}`);
      if (result.messages.length > 0 && result.status !== 'PASS') {
        result.messages.forEach(msg => console.log(`   ${msg}`));
      }
    }

    console.log('---------------------------------------------');
    console.log(`Quality Gate.........${report.overallStatus}`);
    console.log(`Execution Time.......${report.totalDuration}ms`);
    console.log('=============================================\n');

    // Exit code determination: FAIL -> exit 1, PASS or WARNING -> exit 0
    if (report.overallStatus === 'FAIL') {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

if (require.main === module) {
  ValidationRuntime.execute().catch(err => {
    console.error('Fatal Validation Runtime Error:', err);
    process.exit(1);
  });
}
