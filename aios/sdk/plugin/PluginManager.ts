import { IAIOSPluginManager, IAIOSPlugin } from '../contracts';

export class PluginManager implements IAIOSPluginManager {
  private readonly plugins: Map<string, IAIOSPlugin> = new Map();

  public async load(pluginId: string, context?: any): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
        if (context && plugin.initialize) {
            await plugin.initialize(context);
        }
        if (plugin.start) {
            await plugin.start();
        }
    }
  }

  public async unload(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      await plugin.stop();
      this.plugins.delete(pluginId);
    }
  }

  public async reload(pluginId: string): Promise<void> {
    await this.unload(pluginId);
    await this.load(pluginId);
  }

  public listPlugins(): ReadonlyArray<IAIOSPlugin> {
    return Array.from(this.plugins.values());
  }

  public getPlugin<T extends IAIOSPlugin>(pluginId: string): T | undefined {
    return this.plugins.get(pluginId) as T | undefined;
  }

  public register(plugin: IAIOSPlugin): void {
    this.plugins.set(plugin.manifest.pluginId, plugin);
  }
}
