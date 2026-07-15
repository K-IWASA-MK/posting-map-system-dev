import { PluginContext } from './PluginContext';

export interface IAIOSLifecycle {
  initialize(context: PluginContext): Promise<void>;
  start(): Promise<void>;
  suspend?(): Promise<void>;
  resume?(): Promise<void>;
  stop(): Promise<void>;
}
