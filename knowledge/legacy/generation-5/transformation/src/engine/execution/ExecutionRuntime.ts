import { ExecutionDispatcher } from './ExecutionDispatcher';
import { RuntimeScheduler } from './RuntimeScheduler';
import { ExecutionRequest, ExecutionResult } from './models';
import { IExecutionKernel, IPluginRegistry } from '../../models/runtime_ports';

/**
 * ExecutionRuntime (Generation 5)
 * Orchestrates the dispatching and scheduling of Plugin execution to the ExecutionKernel.
 * Prevents direct coupling between the top-level request and the low-level Kernel.
 */
export class ExecutionRuntime {
  private readonly dispatcher: ExecutionDispatcher;
  private readonly scheduler: RuntimeScheduler;

  constructor(
    private readonly kernel: IExecutionKernel,
    private readonly registry: IPluginRegistry
  ) {
    this.scheduler = new RuntimeScheduler(this.kernel, this.registry);
    this.dispatcher = new ExecutionDispatcher(this.registry, this.scheduler);
  }

  /**
   * Main entry point for executing a loaded plugin.
   */
  async executePlugin(pluginId: string, request: ExecutionRequest): Promise<ExecutionResult> {
    return await this.dispatcher.dispatch(pluginId, request);
  }
}
