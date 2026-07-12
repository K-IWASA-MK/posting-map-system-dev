import { IDevelopmentPlugin } from '../plugin/IDevelopmentPlugin';
import { DevelopmentPluginId } from '../plugin/DevelopmentPluginId';
import { DevelopmentContext } from '../context/DevelopmentContext';

export class PluginRegistry {
  private plugins: Map<DevelopmentPluginId | string, IDevelopmentPlugin> = new Map();

  public register(plugin: IDevelopmentPlugin): void {
    const id = plugin.metadata.id;
    if (this.plugins.has(id)) {
      throw new Error(`Plugin with id '${id}' is already registered.`);
    }
    this.plugins.set(id, plugin);
  }

  public findAll(): IDevelopmentPlugin[] {
    return Array.from(this.plugins.values());
  }

  public findById(id: DevelopmentPluginId | string): IDevelopmentPlugin | undefined {
    return this.plugins.get(id);
  }

  public findSupported(context: DevelopmentContext): IDevelopmentPlugin[] {
    return this.findAll().filter(plugin => plugin.supports(context));
  }

  public clear(): void {
    this.plugins.clear();
  }
}
