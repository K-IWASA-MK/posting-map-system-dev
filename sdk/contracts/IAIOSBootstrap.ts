import { IAIOSPluginManager } from './IAIOSPluginManager';

export interface IAIOSBootstrap {
  readonly pluginManager: IAIOSPluginManager;
  
  start(): Promise<void>;
  stop(): Promise<void>;
  health(): Record<string, unknown>;
}
