import { PatternType } from './types';

/**
 * Marker interface for polymorphic Pattern Data.
 * Any specific pattern type (e.g., SequencePatternData) must implement this.
 * Avoids the use of 'any' in the contract.
 */
export interface IPatternData {
  readonly type: PatternType;
}
