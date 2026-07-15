import * as crypto from 'crypto';
import { PluginRegistry } from './PluginRegistry';
import { DevelopmentContext } from '../context/DevelopmentContext';
import { PluginExecutionPlan, PluginExecutionPlanNode } from './PluginExecutionPlan';
import { IDevelopmentPlugin } from '../plugin/IDevelopmentPlugin';

export class PluginLoader {
  /**
   * Evaluates supported plugins from the registry and generates an ordered Execution Plan.
   */
  public loadAndPlan(registry: PluginRegistry, context: DevelopmentContext): PluginExecutionPlan {
    // Note: Future versions will load plugins dynamically from Manifests instead of Registry.
    const supportedPlugins = registry.findSupported(context);

    // Sort by priority (higher priority number executes first)
    const sortedPlugins = supportedPlugins.sort((a, b) => b.metadata.priority - a.metadata.priority);

    const nodes: PluginExecutionPlanNode[] = sortedPlugins.map(plugin => ({
      pluginId: plugin.metadata.id,
      priority: plugin.metadata.priority,
      dependencies: plugin.metadata.dependencies
    }));

    return {
      planId: crypto.randomUUID(),
      nodes: Object.freeze(nodes),
      createdAt: new Date().toISOString()
    };
  }
}
