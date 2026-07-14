import { TrustEvidence, TrustRequest, TrustLevel } from './models';

/**
 * ITrustEvidenceProvider
 * 
 * Abstract provider for gathering trust signals (Checksum, Signature, Cert, SBOM, etc).
 */
export interface ITrustEvidenceProvider {
  /**
   * Evaluates the request and returns an augmented TrustEvidence aggregate.
   */
  provide(request: TrustRequest, currentEvidence: TrustEvidence): Promise<TrustEvidence>;
}

/**
 * ITrustScoreCalculator
 * 
 * Calculates a numerical score strictly based on the provided evidence.
 */
export interface ITrustScoreCalculator {
  calculate(evidence: TrustEvidence): number;
}

/**
 * ITrustPolicyEvaluator
 * 
 * Determines the final TrustLevel based on the score (e.g. Strict vs Production).
 */
export interface ITrustPolicyEvaluator {
  evaluate(score: number): TrustLevel;
}
