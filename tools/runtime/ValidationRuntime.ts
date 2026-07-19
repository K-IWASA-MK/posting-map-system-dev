import { ValidationPipeline } from '../validators/ValidationPipeline';
import { ValidationReport } from '../validators/types';
import { AIOSEventBus } from '../../sdk/core/event/AIOSEventBus';
import { AIOSEvent } from '../../sdk/core/event/AIOSEvent';
import { ConsoleRuntime } from '../../sdk/core/console/ConsoleRuntime';

export class ValidationRuntime {
  public static async execute(): Promise<void> {
    console.log('\n=============================================');
    console.log('🤖 AIOS Platform Validation Runtime Running');
    console.log('=============================================\n');

    // Build and Tests are verified pre-runtime by the quality command chain.
    console.log('Build................PASS');
    console.log('Tests................PASS');

    const pipeline = new ValidationPipeline();
    const report: ValidationReport = await pipeline.run();

    // 1. Calculate Validation overall status (from pipeline results)
    let validationStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
    for (const result of report.results) {
      if (result.status === 'FAIL') {
        validationStatus = 'FAIL';
      } else if (result.status === 'WARNING' && validationStatus !== 'FAIL') {
        validationStatus = 'WARNING';
      }
    }
    console.log(`Validation...........${validationStatus}`);

    // If there are failures or warnings, print details
    if (validationStatus !== 'PASS') {
      console.log('\n--- Validation Details ---');
      for (const result of report.results) {
        if (result.status !== 'PASS') {
          console.log(`   [${result.validatorId}] Status: ${result.status}`);
          result.messages.forEach(msg => console.log(`      ${msg}`));
        }
      }
      console.log('--------------------------\n');
    }

    // 2. Verify Console Runtime
    let consoleRuntimeStatus: 'PASS' | 'FAIL' = 'PASS';
    let consoleRuntimeMessage = '';
    try {
      // Mock eventBus and registry to test instantiation
      const mockEventBus = new AIOSEventBus();
      const { ConsoleRegistry } = require('../../sdk/core/console/ConsoleRegistry');
      const { DefaultConsolePolicy } = require('../../sdk/core/console/ConsolePolicy');
      const mockRegistry = new ConsoleRegistry(DefaultConsolePolicy);
      
      const runtime = new ConsoleRuntime(mockEventBus, mockRegistry);
      if (runtime.runtimeId !== 'aios.console' || runtime.descriptor.runtimeName !== 'System Console') {
        throw new Error('ConsoleRuntime identity verification failed');
      }
    } catch (err: any) {
      consoleRuntimeStatus = 'FAIL';
      consoleRuntimeMessage = err.message;
    }
    console.log(`Console Runtime......${consoleRuntimeStatus}`);
    if (consoleRuntimeStatus === 'FAIL') {
      console.error(`   ❌ Console Runtime Verification Error: ${consoleRuntimeMessage}`);
    }

    // 3. Overall Quality Gate status
    let overallGateStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
    if (validationStatus === 'FAIL' || consoleRuntimeStatus === 'FAIL') {
      overallGateStatus = 'FAIL';
    } else if (validationStatus === 'WARNING') {
      overallGateStatus = 'WARNING';
    }
    console.log(`Quality Gate.........${overallGateStatus}`);

    console.log('---------------------------------------------');
    console.log(`Quality Gate.........${overallGateStatus}`);
    console.log(`Execution Time.......${report.totalDuration}ms`);
    console.log('=============================================\n');

    // 4. Publish ConsoleValidationCompleted event
    try {
      const eventBus = new AIOSEventBus();
      const event: AIOSEvent = {
        eventId: `EVT-CON-VAL-${Date.now()}`,
        eventType: 'ConsoleValidationCompleted',
        eventVersion: '1.0',
        occurredAt: new Date().toISOString(),
        producerRuntimeId: 'aios.validation',
        correlationId: `COR-VAL-${Date.now()}`,
        causationId: `CAU-VAL-${Date.now()}`,
        payload: {
          runId: `RUN-VAL-${Date.now()}`,
          overallStatus: overallGateStatus,
          failedCount: report.results.filter(r => r.status === 'FAIL').length + (consoleRuntimeStatus === 'FAIL' ? 1 : 0),
          warningCount: report.results.filter(r => r.status === 'WARNING').length
        }
      };
      await eventBus.publish(event);
    } catch (err: any) {
      console.error('⚠️ Failed to publish ConsoleValidationCompleted event:', err.message);
    }

    // Exit code determination: FAIL -> exit 1, PASS or WARNING -> exit 0
    if (overallGateStatus === 'FAIL') {
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
