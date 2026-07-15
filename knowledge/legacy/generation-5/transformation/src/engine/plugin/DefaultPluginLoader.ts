import { IPluginLoader } from '../../models/runtime_ports';
import { 
  IPlugin, 
  PluginManifest, 
  PluginDescriptor, 
  PluginState, 
  PluginOrigin,
  PluginKind
} from '../../models/plugin';

/**
 * DefaultPluginLoader
 * 
 * Validates the manifest payload, checks API compatibility, and parses it 
 * into a valid IPlugin. Does NOT register it.
 */
export class DefaultPluginLoader implements IPluginLoader {
  
  constructor(private readonly currentApiVersion: string) {}

  async load(manifestPayload: unknown): Promise<IPlugin> {
    const manifest = this.validateManifest(manifestPayload);
    this.checkApiCompatibility(manifest);

    const descriptor: PluginDescriptor = {
      manifest,
      state: 'DISCOVERED', // Initial state
      origin: PluginOrigin.LOCAL, // Defaulting to LOCAL for now, can be parameterized
      installedAt: new Date().toISOString()
    };

    // Return a base IPlugin. Subclasses or specific loaders might return IWorkerPlugin.
    return { descriptor };
  }

  private validateManifest(payload: any): PluginManifest {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Manifest Validation Failed: Payload must be an object');
    }

    if (!payload.pluginId || typeof payload.pluginId !== 'string') {
      throw new Error('Manifest Validation Failed: Missing or invalid pluginId');
    }

    // A real implementation would use Zod or JSON Schema here.
    return payload as PluginManifest;
  }

  private checkApiCompatibility(manifest: PluginManifest): void {
    const current = this.parseVersion(this.currentApiVersion);
    const min = this.parseVersion(manifest.minimumApiVersion);
    const max = this.parseVersion(manifest.maximumApiVersion);

    if (current < min) {
      throw new Error(`API Compatibility Error: OS API (${this.currentApiVersion}) is older than plugin minimum (${manifest.minimumApiVersion})`);
    }

    if (current > max) {
      throw new Error(`API Compatibility Error: OS API (${this.currentApiVersion}) is newer than plugin maximum (${manifest.maximumApiVersion})`);
    }
  }

  private parseVersion(version: string): number {
    // Simplistic version parser for demonstration (e.g., "1.2.3" -> 10203)
    // In production, use semver logic.
    if (!version) return 0;
    const parts = version.split('.').map(Number);
    return (parts[0] || 0) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
  }
}
