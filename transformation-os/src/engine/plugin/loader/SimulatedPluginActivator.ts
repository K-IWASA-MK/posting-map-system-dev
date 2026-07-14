import { IPluginActivator } from './interfaces';
import { PluginContext } from './models';
import { IPlugin, PluginManifest, PluginOrigin } from '../../../models/plugin';

/**
 * SimulatedPluginActivator simulates sandbox operations.
 * Designed to be replaced by WasmPluginActivator or V8PluginActivator in Generation 6.
 */
export class SimulatedPluginActivator implements IPluginActivator {
  private activeSandboxes: Map<string, { manifest: PluginManifest, state: 'PREPARED' | 'ACTIVE' }> = new Map();

  async prepare(context: PluginContext, archiveData: Uint8Array): Promise<void> {
    if (this.activeSandboxes.has(context.sandboxId)) {
      throw new Error(`Sandbox ${context.sandboxId} is already allocated.`);
    }

    // Simulate manifest parsing from archiveData
    // In reality, this would decompress or read WASM sections.
    const manifestStr = new TextDecoder().decode(archiveData);
    let manifest: PluginManifest;
    try {
      manifest = JSON.parse(manifestStr);
    } catch {
      // Fallback dummy manifest for testing purposes if arbitrary bytes are passed
      manifest = {
        pluginId: `mock-plugin-${context.sandboxId}`,
        version: '1.0.0',
        minimumApiVersion: '1.0.0',
        maximumApiVersion: '2.0.0',
        entryPoint: 'main.js'
      };
    }

    // Store state to simulate allocated memory
    this.activeSandboxes.set(context.sandboxId, { manifest, state: 'PREPARED' });
  }

  async activate(context: PluginContext): Promise<IPlugin> {
    const sandbox = this.activeSandboxes.get(context.sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${context.sandboxId} not found or not prepared.`);
    }

    sandbox.state = 'ACTIVE';

    // Simulate returning the instantiated plugin
    return {
      descriptor: {
        manifest: sandbox.manifest,
        state: 'ACTIVATING', // This gets transitioned to ACTIVE by the loader/lifecycle
        origin: PluginOrigin.MARKETPLACE,
        installedAt: new Date().toISOString()
      }
    };
  }

  async dispose(context: PluginContext): Promise<void> {
    if (this.activeSandboxes.has(context.sandboxId)) {
      this.activeSandboxes.delete(context.sandboxId);
    }
  }
}
