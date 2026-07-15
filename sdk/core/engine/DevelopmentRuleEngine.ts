import { WorkspaceManifest } from "../workspace/WorkspaceManifest";
import { WorkspacePolicy } from "../workspace/WorkspacePolicy";

import { DevelopmentContext } from '../context/DevelopmentContext';
import { ExecutionSessionBuilder, ExecutionSessionStatus } from './ExecutionSession';
import { PluginRegistry } from './PluginRegistry';
import { PluginLoader } from './PluginLoader';
import { PluginExecutionResult } from './PluginExecutionResult';
import { PluginExecutionContext } from './PluginExecutionContext';
import { DevelopmentPluginStatus } from '../plugin/DevelopmentPluginStatus';
import { PluginLifecycleManager } from '../plugin/PluginLifecycleManager';
import { DevelopmentPluginResult } from '../plugin/DevelopmentPluginResult';
import { IDevelopmentPlugin } from '../plugin/IDevelopmentPlugin';
import { RepositoryManifest } from '../repository/RepositoryManifest';
import { RepositoryPolicy } from '../repository/rules/RepositoryPolicy';
import { DevelopmentGovernanceDecision } from '../governance/DevelopmentGovernanceDecision';

export class DevelopmentRuleEngine {
  private registry: PluginRegistry;
  private loader: PluginLoader;

  constructor(registry: PluginRegistry) {
    this.registry = registry;
    this.loader = new PluginLoader();
  }

  public async execute(context: DevelopmentContext): Promise<PluginExecutionResult> {
    const startTime = Date.now();
    const session = new ExecutionSessionBuilder().build();

    // 1. Loader & Plan Creation
    const plan = this.loader.loadAndPlan(this.registry, context);

    const executedPlugins: string[] = [];
    const failedPlugins: string[] = [];
    const results: DevelopmentPluginResult[] = [];

    // Shared state container for plugins
    const sharedState = Object.freeze({});

    // 2. Iterate over execution plan (currently sequentially by priority)
    for (const node of plan.nodes) {
      const plugin = this.registry.findById(node.pluginId);
      if (!plugin) continue;

      executedPlugins.push(node.pluginId);

      const pluginContext: PluginExecutionContext = Object.freeze({
        context,
        session,
        plan,
        sharedState
      });

      try {
        await this.runPluginLifecycle(plugin, pluginContext);
        const report = await plugin.report(pluginContext);
        results.push(report);
      } catch (error) {
        console.error(`Plugin ${node.pluginId} failed during execution`, error);
        failedPlugins.push(node.pluginId);
        this.safeSetStatus(plugin, DevelopmentPluginStatus.FAILED);
      } finally {
        // Ensure DISPOSED is always called
        if (plugin.status !== DevelopmentPluginStatus.DISPOSED) {
          try {
            await plugin.dispose();
            this.safeSetStatus(plugin, DevelopmentPluginStatus.DISPOSED);
          } catch (disposeError) {
            console.error(`Plugin ${node.pluginId} failed during dispose`, disposeError);
          }
        }
      }
    }

    // 3. Aggregate & Create Ledger Event
    const durationMs = Date.now() - startTime;
    
    const executionResult: PluginExecutionResult = Object.freeze({
      results: Object.freeze(results),
      durationMs,
      executedPlugins: Object.freeze(executedPlugins),
      failedPlugins: Object.freeze(failedPlugins),
      generatedAt: new Date().toISOString()
    });

    this.emitLedgerEvent(context, session, plan, executionResult);

    return executionResult;
  }

  private async runPluginLifecycle(plugin: IDevelopmentPlugin, context: PluginExecutionContext): Promise<void> {
    // Engine forcibly controls the state transitions using the Manager
    this.safeSetStatus(plugin, DevelopmentPluginStatus.DISCOVERED);
    this.safeSetStatus(plugin, DevelopmentPluginStatus.LOADED);

    await plugin.initialize(context);
    this.safeSetStatus(plugin, DevelopmentPluginStatus.INITIALIZED);
    this.safeSetStatus(plugin, DevelopmentPluginStatus.READY);

    this.safeSetStatus(plugin, DevelopmentPluginStatus.RUNNING);

    await plugin.beforeValidate(context);
    await plugin.validate(context);
    await plugin.afterValidate(context);
    await plugin.review(context);
    await plugin.govern(context);

    this.safeSetStatus(plugin, DevelopmentPluginStatus.COMPLETED);
  }

  private safeSetStatus(plugin: IDevelopmentPlugin, status: DevelopmentPluginStatus): void {
    // We bypass readonly status specifically within the engine orchestrator wrapper
    // In a real TS environment we might use a symbol or proxy, but here we cast
    PluginLifecycleManager.validateTransition(plugin.status, status);
    (plugin as any).status = status;
  }

  private emitLedgerEvent(
    context: DevelopmentContext,
    session: any,
    plan: any,
    result: PluginExecutionResult
  ): void {
    // Generate Ledger event. Actual saving to DB is S7-7.
    console.log(`[Ledger Event Generated] Session: ${session.sessionId}, Duration: ${result.durationMs}ms, Executed: ${result.executedPlugins.length}`);
  }

  public evaluateRepository(manifest: RepositoryManifest, policy: RepositoryPolicy = new RepositoryPolicy()): DevelopmentGovernanceDecision {
    return policy.evaluate(manifest);
  }

  public evaluateWorkspace(manifest: WorkspaceManifest, policy: WorkspacePolicy = new WorkspacePolicy()): DevelopmentGovernanceDecision {
    return policy.evaluate(manifest);
  }
}
