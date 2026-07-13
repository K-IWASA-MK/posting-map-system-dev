import { IAIOSPlugin } from './IAIOSPlugin';

export interface IAIOSPluginManager {
  load(pluginId: string): Promise<void>;
  unload(pluginId: string): Promise<void>;
  reload(pluginId: string): Promise<void>;
  listPlugins(): ReadonlyArray<IAIOSPlugin>;
  getPlugin<T extends IAIOSPlugin>(pluginId: string): T | undefined;
}
