import { LearningPattern } from './LearningPattern';
import { IPatternStatistics } from './IPatternStatistics';

/**
 * A thin DTO representing the outcome of a Learning Engine extraction.
 * The primary artifacts are the patterns themselves.
 */
export interface LearningResult {
  readonly schemaVersion: string;
  readonly patterns: ReadonlyArray<LearningPattern>;
  readonly statistics: IPatternStatistics;
  readonly durationMs: number;
}
