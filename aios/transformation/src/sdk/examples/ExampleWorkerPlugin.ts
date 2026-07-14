import { WorkerPluginBase } from '../WorkerPluginBase';
import { Command, OSEvent } from '../../models/protocol';
import { PluginContext } from '../models';

/**
 * ExampleWorkerPlugin
 * 
 * This is the canonical example of how to implement a Worker Plugin using the SDK.
 * Best Practices demonstrated here:
 * 1. Extending WorkerPluginBase.
 * 2. Implementing the strongly-typed `doExecute` with `PluginContext`.
 * 3. Using SDK Services (`logger`, `metrics`, `tracer`) safely.
 * 4. Utilizing Hooks for setup and teardown.
 * 5. Returning OSEvents cleanly without Side-Effects outside the scope.
 */
export class ExampleWorkerPlugin extends WorkerPluginBase {
  
  // --- Lifecycle Hooks (Optional) ---

  async beforeExecute(context: PluginContext): Promise<void> {
    context.services.logger.info(`ExampleWorkerPlugin starting execution: ${context.execution.executionId}`);
    context.services.tracer.startSpan('ExampleWorkerPlugin_Execute');
  }

  async afterExecute(context: PluginContext): Promise<void> {
    context.services.tracer.endSpan('ExampleWorkerPlugin_Execute');
    context.services.metrics.increment('plugin.example.executions');
    context.services.logger.info(`ExampleWorkerPlugin finished execution: ${context.execution.executionId}`);
  }

  async onError(error: Error, context: PluginContext): Promise<void> {
    context.services.tracer.addTag('error', error.message);
    context.services.tracer.endSpan('ExampleWorkerPlugin_Execute');
    context.services.metrics.increment('plugin.example.errors');
    context.services.logger.error(`ExampleWorkerPlugin failed: ${context.execution.executionId}`, error);
  }

  // --- Core Execution Logic (Required) ---

  protected async doExecute(command: Command, context: PluginContext): Promise<readonly OSEvent[]> {
    
    // 1. Business Logic
    context.services.logger.debug('Processing command payload', { payload: command.payload });

    if (!command.payload || (command.payload as any).shouldFail) {
      throw new Error("Simulated business logic failure");
    }

    // 2. Event Emission
    // Workers return events to the ExecutionKernel. 
    // They do NOT publish directly to the EventStore or EventBus.
    const resultEvent: OSEvent = {
      eventId: `evt-${Date.now()}`,
      subjectURI: 'resource://example/123',
      type: 'ExampleProcessed',
      timestamp: new Date().toISOString(),
      source: this.descriptor.manifest.pluginId,
      data: {
        processedAttempt: context.execution.attempt,
        commandVersion: command.version
      }
    };

    return [resultEvent];
  }
}
