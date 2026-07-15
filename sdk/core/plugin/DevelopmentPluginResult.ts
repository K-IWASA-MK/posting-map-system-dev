import { DevelopmentPluginId } from './DevelopmentPluginId';
import { DevelopmentPluginStatus } from './DevelopmentPluginStatus';

export interface DevelopmentPluginResult {
  readonly pluginId: DevelopmentPluginId | string;
  readonly status: DevelopmentPluginStatus;
  readonly durationMs: number;
  readonly validationResult?: any;
  readonly reviewResult?: any;
  readonly governanceResult?: any;
  readonly report?: any;
  readonly artifacts: readonly string[];
  readonly confidence?: number;
  readonly generatedAt: string;
}
