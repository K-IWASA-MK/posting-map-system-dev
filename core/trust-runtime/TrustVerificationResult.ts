import { TrustEvaluation } from './TrustEvaluation';

/**
 * TrustVerificationResult represents the final execution decision paired with its supporting evaluation.
 */
export interface TrustVerificationResult {
  readonly decision: 'allow' | 'deny';
  readonly evaluation: TrustEvaluation;
}
