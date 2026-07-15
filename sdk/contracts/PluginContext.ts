import { PluginLogger } from './PluginLogger';
import { PluginEventBus } from './PluginEvent';

export interface PluginContext {
  readonly pluginId: string;
  readonly logger: PluginLogger;
  readonly events: PluginEventBus;
  
  getConfig<T>(key: string): T | undefined;
  getService<T>(serviceName: string): T | undefined;
}
