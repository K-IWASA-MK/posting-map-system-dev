import { DevelopmentPluginResult } from '../plugin/DevelopmentPluginResult';
import { DevelopmentPluginId } from '../plugin/DevelopmentPluginId';

export interface PluginExecutionResult {
  readonly results: readonly DevelopmentPluginResult[];
  readonly durationMs: number;
  readonly executedPlugins: readonly (DevelopmentPluginId | string)[];
  readonly failedPlugins: readonly (DevelopmentPluginId | string)[];
  readonly generatedAt: string;
}
