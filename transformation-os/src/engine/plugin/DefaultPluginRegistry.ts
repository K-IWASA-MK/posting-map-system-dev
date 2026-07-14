import { IPluginRegistry } from '../../models/runtime_ports';
import { IPlugin, PluginId } from '../../models/plugin';
import { PluginLifecyclePolicy } from './PluginLifecycle';

/**
 * DefaultPluginRegistry
 * 
 * Manages the definitive state of loaded plugins.
 * Only the Registry should insert or remove plugins from the OS memory.
 */
export class DefaultPluginRegistry implements IPluginRegistry {
  private readonly plugins: Map<PluginId, IPlugin> = new Map();

  register(plugin: IPlugin): void {
    const id = plugin.descriptor.manifest.pluginId;

    if (this.plugins.has(id)) {
      throw new Error(`Plugin Registration Failed: Duplicate pluginId '${id}'`);
    }

    // A newly loaded plugin should be in DISCOVERED state.
    // The act of registering transitions it to REGISTERED.
    PluginLifecyclePolicy.validateTransition(plugin.descriptor.state, 'REGISTERED');
    
    // We create a new descriptor with the updated state
    const registeredPlugin: IPlugin = {
      ...plugin,
      descriptor: {
        ...plugin.descriptor,
        state: 'REGISTERED'
      }
    };

    this.plugins.set(id, registeredPlugin);
  }

  unregister(id: PluginId): void {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Plugin Unregistration Failed: PluginId '${id}' not found`);
    }

    // Validate transition to UNLOADED
    PluginLifecyclePolicy.validateTransition(plugin.descriptor.state, 'UNLOADED');

    // Remove from registry
    this.plugins.delete(id);
  }

  get(id: PluginId): IPlugin | undefined {
    return this.plugins.get(id);
  }

  list(): readonly IPlugin[] {
    return Array.from(this.plugins.values());
  }

  // Helper method for OS core to transition plugin states (e.g., LOADED -> ACTIVE)
  transitionState(id: PluginId, targetState: import('../../models/plugin').PluginState): void {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error(`Plugin not found: ${id}`);

    PluginLifecyclePolicy.validateTransition(plugin.descriptor.state, targetState);

    const updatedPlugin: IPlugin = {
      ...plugin,
      descriptor: {
        ...plugin.descriptor,
        state: targetState,
        loadedAt: targetState === 'LOADED' ? new Date().toISOString() : plugin.descriptor.loadedAt
      }
    };

    this.plugins.set(id, updatedPlugin);
  }
}
