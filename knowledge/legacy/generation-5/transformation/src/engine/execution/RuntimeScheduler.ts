import { IRuntimeScheduler } from './interfaces';
import { ExecutionRequest, ExecutionPlan, ExecutionToken, ExecutionResult } from './models';
import { IExecutionKernel } from '../../models/runtime_ports';
import { ExecutionContext } from '../../models/kernel';
import { IPluginRegistry } from '../../models/runtime_ports';
import { PluginWorker } from './PluginWorker';
import { PluginContext } from '../plugin/loader/models';

export class RuntimeScheduler implements IRuntimeScheduler {
  private tokens = new Map<string, ExecutionToken>();

  constructor(
    private readonly kernel: IExecutionKernel,
    private readonly registry: IPluginRegistry
  ) {}

  async enqueue(plan: ExecutionPlan, request: ExecutionRequest): Promise<ExecutionToken> {
    const token: ExecutionToken = {
      tokenId: `tok-${request.requestId}-${Date.now()}`,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + plan.timeout).toISOString(),
      runtimeId: 'local-gen5'
    };
    this.tokens.set(token.tokenId, token);
    return token;
  }

  async schedule(token: ExecutionToken, plan: ExecutionPlan, request: ExecutionRequest): Promise<ExecutionResult> {
    if (!this.tokens.has(token.tokenId)) {
      return { success: false, error: 'Invalid or cancelled token' };
    }

    const plugin = this.registry.getPlugin(plan.pluginId);
    if (!plugin) {
      return { success: false, error: `Plugin not found during schedule: ${plan.pluginId}` };
    }

    const pluginContext: PluginContext = {
      runtimeId: token.runtimeId,
      sandboxId: `sbx-${plan.pluginId}`,
      memoryLimit: 128 * 1024 * 1024,
      trustScore: 100, // Derived from TrustedPlugin initially, mock for now
      executionPolicy: plan.executionPolicy
    };

    const worker = new PluginWorker(plugin, pluginContext, token);

    const executionContext: ExecutionContext = {
      executionId: request.executionId,
      traceId: request.requestId,
      startedAt: new Date().toISOString(),
      timeoutMs: plan.timeout,
      maxRetries: plan.retryPolicy,
      remainingBudget: 1000,
      trustLevel: 'INTERNAL',
      cancellationToken: {
        isCancellationRequested: false,
        onCancellationRequested: () => {}
      },
      metadata: {}
    };

    try {
      // Direct call to kernel
      const events = await this.kernel.execute(executionContext, request.command, worker);
      return { success: true, events };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown execution error' };
    }
  }

  async cancel(token: ExecutionToken): Promise<void> {
    this.tokens.delete(token.tokenId);
  }
}
