import { IWorkerPlugin } from '../models/runtime_ports';
import { PluginBase } from './PluginBase';
import { ExecutableCapability } from './capabilities';
import { Command, OSEvent } from '../models/protocol';
import { ExecutionAttempt } from '../models/kernel';
import { PluginContext, PluginServices, SdkDescriptor } from './models';
import { PluginDescriptor } from '../models/plugin';

/**
 * WorkerPluginBase
 * 
 * Base class for all Worker Plugins. It composes PluginBase and ExecutableCapability.
 * It acts as the bridge between the OS Core's IWorker interface and the SDK's PluginContext.
 */
export abstract class WorkerPluginBase extends PluginBase implements IWorkerPlugin, ExecutableCapability {

  constructor(
    descriptor: PluginDescriptor,
    sdkDescriptor: SdkDescriptor,
    protected readonly services: PluginServices
  ) {
    super(descriptor, sdkDescriptor);
  }

  // --- IWorker (OS Core) & ExecutableCapability (SDK) ---

  // We use overloads to satisfy both the OS Core interface and the Capability interface
  execute(command: Command, context: PluginContext): Promise<readonly OSEvent[]>;
  execute(command: Command, attempt: ExecutionAttempt): Promise<readonly OSEvent[]>;
  async execute(command: Command, arg: PluginContext | ExecutionAttempt): Promise<readonly OSEvent[]> {
    
    let context: PluginContext;

    if ('services' in arg) {
      // Called via ExecutableCapability (SDK-style)
      context = arg as PluginContext;
    } else {
      // Called via IWorker (OS Core-style)
      context = {
        execution: arg as ExecutionAttempt,
        services: this.services
      };
    }

    // Plugin Hooks Pipeline
    await this.beforeExecute(context);
    try {
      // Delegate to subclass implementation
      const result = await this.doExecute(command, context);
      await this.afterExecute(context);
      return result;
    } catch (error) {
      await this.onError(error as Error, context);
      throw error;
    }
  }

  /**
   * Abstract method to be implemented by the specific Worker plugin.
   * Receives the fully constructed PluginContext instead of the raw ExecutionAttempt.
   */
  protected abstract doExecute(command: Command, context: PluginContext): Promise<readonly OSEvent[]>;
}
