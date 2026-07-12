/**
 * Base interface for Pattern Statistics.
 * Expected to be extended by specific Pattern implementations.
 */
export interface IPatternStatistics {
  readonly sampleCount: number;
  readonly occurrence: number;
}
