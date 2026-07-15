import { PluginLogger } from '../contracts';

export class DefaultPluginLogger implements PluginLogger {
  constructor(private readonly pluginId: string) {}

  info(message: string, context?: Record<string, unknown>): void {
    console.log(`[INFO][${this.pluginId}] ${message}`, context || '');
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN][${this.pluginId}] ${message}`, context || '');
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    console.error(`[ERROR][${this.pluginId}] ${message}`, error || '', context || '');
  }

  debug(message: string, context?: Record<string, unknown>): void {
    console.debug(`[DEBUG][${this.pluginId}] ${message}`, context || '');
  }
}
