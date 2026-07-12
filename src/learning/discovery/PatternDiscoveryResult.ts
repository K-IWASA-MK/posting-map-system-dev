import { IPatternData, IPatternStatistics, PatternType } from '../contracts';

/**
 * Represents a single extracted pattern result from the Discovery layer.
 * Not yet a fully formed LearningPattern asset.
 */
export interface DiscoveredPatternItem {
  readonly type: PatternType;
  readonly data: IPatternData;
  readonly stats: IPatternStatistics;
}

/**
 * The structured result returned by the PatternDiscovery facade.
 * Provides valuable metrics for the Learning Pipeline.
 */
export interface PatternDiscoveryResult {
  readonly patterns: ReadonlyArray<DiscoveredPatternItem>;
  readonly pluginCount: number;
  readonly skippedPlugins: number;
  readonly durationMs: number;
}
