import { TrustScore } from './TrustScore';

/**
 * TrustEvaluation is the raw assessment returned from the TrustEvaluator.
 */
export interface TrustEvaluation {
  readonly score: TrustScore;
  readonly reasons: string[];
}
