import { IPackageCache } from './interfaces';
import { DownloadedPlugin } from './models';

export class DefaultPackageCache implements IPackageCache {
  private cache = new Map<string, DownloadedPlugin>();

  private key(pluginId: string, version: string): string {
    return `${pluginId}:${version}`;
  }

  async get(pluginId: string, version: string): Promise<DownloadedPlugin | undefined> {
    return this.cache.get(this.key(pluginId, version));
  }

  async put(plugin: DownloadedPlugin): Promise<void> {
    this.cache.set(this.key(plugin.pluginId, plugin.version), plugin);
  }

  async has(pluginId: string, version: string): Promise<boolean> {
    return this.cache.has(this.key(pluginId, version));
  }
}
