import { PatternType } from '../contracts';
import { LearningPlugin } from './LearningPlugin';
import { PatternDescriptor } from './PatternDescriptor';
import { PluginStatus } from './PluginStatus';

/**
 * Registry that manages Pattern Plugins.
 * Plugins are registered here, inverting the dependency (Plugins do not know about the Registry).
 */
export class PatternRegistry {
  private readonly descriptors = new Map<string, PatternDescriptor>();

  public register(plugin: LearningPlugin): void {
    if (this.descriptors.has(plugin.pluginId)) {
      throw new Error(`Plugin with ID ${plugin.pluginId} is already registered.`);
    }
    
    this.descriptors.set(plugin.pluginId, {
      plugin,
      registeredAt: new Date().toISOString(),
      status: PluginStatus.ENABLED
    });
  }

  public getDescriptor(pluginId: string): PatternDescriptor | undefined {
    return this.descriptors.get(pluginId);
  }

  public findByPluginId(pluginId: string): LearningPlugin | undefined {
    return this.descriptors.get(pluginId)?.plugin;
  }

  public findByPatternType(type: PatternType): ReadonlyArray<LearningPlugin> {
    return Array.from(this.descriptors.values())
      .filter(d => d.plugin.targetPatternType === type)
      .map(d => d.plugin);
  }

  public getAllEnabledPlugins(): ReadonlyArray<LearningPlugin> {
    return Array.from(this.descriptors.values())
      .filter(d => d.status === PluginStatus.ENABLED)
      .map(d => d.plugin)
      .sort((a, b) => b.priority - a.priority);
  }
}
