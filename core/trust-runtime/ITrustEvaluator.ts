import { TrustEvidence } from './TrustEvidence';
import { TrustEvaluation } from './TrustEvaluation';

/**
 * ITrustEvaluator defines the contract for evaluating project evidence into a TrustEvaluation.
 */
export interface ITrustEvaluator {
  /**
   * Evaluates trust parameters pure functionally.
   * @param evidence Ingested execution context evidence.
   */
  evaluate(evidence: TrustEvidence): TrustEvaluation;
}
