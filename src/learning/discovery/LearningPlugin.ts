import { PatternType } from '../contracts';
import { IPatternExtractor } from './IPatternExtractor';
import { IPatternData, IPatternStatistics } from '../contracts';

/**
 * The contract for a Learning Plugin.
 * It encapsulates the extractor and its metadata, ready for UI display
 * (e.g., in Sprint 10 Knowledge OS Plugin Browser).
 */
export interface LearningPlugin {
  readonly schemaVersion: string;
  readonly pluginId: string;
  readonly version: string;
  readonly name: string;
  readonly description: string;
  readonly priority: number;

  readonly targetPatternType: PatternType;
  readonly extractor: IPatternExtractor<IPatternData, IPatternStatistics>;
}
