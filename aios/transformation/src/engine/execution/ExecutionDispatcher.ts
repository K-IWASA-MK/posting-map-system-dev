import { ExecutionRequest, ExecutionPlan, ExecutionResult } from './models';
import { IPluginRegistry } from '../../models/runtime_ports';
import { IRuntimeScheduler } from './interfaces';

export class ExecutionDispatcher {
  constructor(
    private readonly registry: IPluginRegistry,
    private readonly scheduler: IRuntimeScheduler
  ) {}

  async dispatch(pluginId: string, request: ExecutionRequest): Promise<ExecutionResult> {
    const plugin = this.registry.getPlugin(pluginId);
    
    if (!plugin) {
      return { success: false, error: `Plugin not found: ${pluginId}` };
    }

    if (plugin.descriptor.state !== 'ACTIVE') {
      return { success: false, error: `Plugin is not ACTIVE. Current state: ${plugin.descriptor.state}` };
    }

    const plan: ExecutionPlan = {
      pluginId,
      priority: 1, // Default priority in Gen 5
      retryPolicy: 3,
      timeout: 5000,
      executionPolicy: 'RESTRICTED'
    };

    const token = await this.scheduler.enqueue(plan, request);
    return await this.scheduler.schedule(token, plan, request);
  }
}
