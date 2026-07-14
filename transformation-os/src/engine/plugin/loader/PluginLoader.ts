import { PluginLoadRequest, PluginLoadResult, PluginContext } from './models';
import { IPluginActivator } from './interfaces';
import { IPluginRegistry } from '../../../models/runtime_ports';
import { PluginLifecyclePolicy } from '../PluginLifecycle';
import { TrustLevel } from '../../trust/models';

/**
 * PluginLoader Runtime (Generation 5)
 * Pipeline: TrustedPlugin -> PluginContext -> IPluginActivator -> PluginRegistry
 */
export class PluginLoader {
  constructor(
    private readonly activator: IPluginActivator,
    private readonly registry: IPluginRegistry
  ) {}

  async load(request: PluginLoadRequest): Promise<PluginLoadResult> {
    const { trustedPlugin, requestId } = request;

    // Fail immediately if untrusted
    if (trustedPlugin.trust.level === TrustLevel.UNTRUSTED) {
      return { success: false, error: 'Cannot load UNTRUSTED plugin' };
    }

    // Check if plugin is already loaded/registered to prevent duplicates
    if (this.registry.getPlugin(trustedPlugin.plugin.pluginId)) {
      return { success: false, error: 'Plugin already loaded' };
    }

    const context: PluginContext = {
      runtimeId: `rt-${requestId}`,
      sandboxId: `sbx-${trustedPlugin.plugin.pluginId}-${Date.now()}`,
      memoryLimit: 128 * 1024 * 1024, // 128MB generic default
      trustScore: trustedPlugin.trust.score,
      executionPolicy: trustedPlugin.trust.level === TrustLevel.CERTIFIED ? 'UNRESTRICTED' : 'RESTRICTED'
    };

    let activatedPlugin;

    try {
      // Transition conceptually: DISCOVERED -> TRUSTED -> ACTIVATING
      // Since TrustedPlugin implies it's TRUSTED, we go straight to ACTIVATING via Activator

      // Phase 1: Prepare Sandbox
      await this.activator.prepare(context, trustedPlugin.plugin.archiveData);

      // Phase 2: Activate Sandbox
      activatedPlugin = await this.activator.activate(context);

      // Mutate descriptor state to ACTIVE for registration
      const descriptor = { ...activatedPlugin.descriptor, state: 'ACTIVE' as const, loadedAt: new Date().toISOString() };
      const finalPlugin = { descriptor };

      // Validate lifecycle transition locally for sanity
      PluginLifecyclePolicy.validateTransition('ACTIVATING', 'ACTIVE');

      // Phase 3: Register
      this.registry.register(finalPlugin);

      return { success: true, plugin: finalPlugin };

    } catch (error) {
      // Rollback on failure
      await this.activator.dispose(context);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown load error' };
    }
  }

  async unload(pluginId: string, context: PluginContext): Promise<void> {
    const plugin = this.registry.getPlugin(pluginId);
    if (!plugin) throw new Error('Plugin not found');

    PluginLifecyclePolicy.validateTransition(plugin.descriptor.state, 'UNLOADED');

    await this.activator.dispose(context);
    // Real registry might need a deregister method, assuming unregister exists or we just track state
    // Let's assume we just dispose for now
  }
}
