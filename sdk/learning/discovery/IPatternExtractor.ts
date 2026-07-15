import { IPatternData, IPatternStatistics } from '../contracts';
import { LearningDataset } from '../contracts/LearningDataset';

/**
 * Interface for the core extraction algorithm of a specific PatternType.
 * It is a pure function that deterministically extracts patterns from a Dataset.
 */
export interface IPatternExtractor<
  TData extends IPatternData = IPatternData,
  TStats extends IPatternStatistics = IPatternStatistics
> {
  /**
   * Evaluates if the given dataset meets the requirements for this extractor.
   * e.g., Sequence pattern needs event order, Correlation needs numeric metrics.
   */
  supports(dataset: LearningDataset): boolean;
  
  /**
   * Deterministically extracts patterns from the dataset.
   */
  extract(dataset: LearningDataset): ReadonlyArray<{ data: TData, stats: TStats }>;
}
