import { IPatternStatistics } from '../../contracts';

export interface SequencePatternStatistics extends IPatternStatistics {
  readonly sampleCount: number;
  readonly occurrenceCount: number;
}
