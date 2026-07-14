import { ITrustEvidenceProvider, ITrustScoreCalculator, ITrustPolicyEvaluator } from './interfaces';
import { TrustRequest, TrustResult, TrustEvidence, TrustLevel } from './models';

export class TrustRuntime {
  constructor(
    private readonly providers: ITrustEvidenceProvider[],
    private readonly scoreCalculator: ITrustScoreCalculator,
    private readonly policyEvaluator: ITrustPolicyEvaluator,
    public readonly runtimeVersion: string = '1.0.0'
  ) {}

  /**
   * Evaluates trust strictly by delegating to Providers, Calculator, and Evaluator.
   * TrustRuntime itself contains no verification logic or policy.
   */
  async evaluate(request: TrustRequest): Promise<TrustResult> {
    let evidence = new TrustEvidence({});

    for (const provider of this.providers) {
      try {
        // Collect evidence. TrustEvidence is immutable, so each provider returns a new augmented instance.
        evidence = await provider.provide(request, evidence);
      } catch (error) {
        // Failure != Untrusted. 
        // e.g. Network timeout while checking a certificate leaves the evidence missing, which maps to UNKNOWN.
        // It does not explicitly set `certificateValid = false` unless the provider explicitly determines it's revoked or invalid.
      }
    }

    const score = this.scoreCalculator.calculate(evidence);
    let level = this.policyEvaluator.evaluate(score);

    // Hard fail overrides (Failure Isolation)
    // If we explicitly proved a mismatch or invalid signature, it must never be TRUSTED/CERTIFIED.
    if (evidence.checksumMatches === false || evidence.signatureValid === false || evidence.certificateNotRevoked === false) {
      level = TrustLevel.UNTRUSTED;
    }

    return {
      score,
      level,
      evidence,
      evaluatedAt: new Date().toISOString(),
      evaluatorVersion: this.runtimeVersion
    };
  }
}
