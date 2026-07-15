import { PluginExecutionContext } from '../plugin-runtime/PluginExecutionContext';
import { ITrustMonitoringView } from './ITrustMonitoringView';
import { ITrustEvaluator } from './ITrustEvaluator';
import { ISignatureVerifier } from './ISignatureVerifier';
import { TrustVerificationResult } from './TrustVerificationResult';
import { TrustValidationError } from './TrustRuntimeErrors';
import { TrustEvidence } from './TrustEvidence';
import { TrustPolicy } from './TrustPolicy';

/**
 * TrustRuntimeVerifier verifies execution context by checking signatures and score evaluations.
 * Conforms to: Evaluates trust only. Depends on immutable evidence. Does not spawn processes.
 */
export class TrustRuntimeVerifier {
  private readonly evaluator: ITrustEvaluator;
  private readonly signatureVerifier: ISignatureVerifier;

  constructor(evaluator: ITrustEvaluator, signatureVerifier: ISignatureVerifier) {
    this.evaluator = evaluator;
    this.signatureVerifier = signatureVerifier;
  }

  /**
   * Verifies context signature first, evaluates trust indicators, and decides allow or deny.
   * Throws TrustValidationError when validation constraints fail.
   * @param context Target execution context parameters.
   * @param monitoringView Read-only metrics database accessor.
   * @param signature Cryptographic plugin signature payload.
   */
  public verify(
    context: PluginExecutionContext,
    monitoringView: ITrustMonitoringView,
    signature?: string
  ): TrustVerificationResult {
    // 1. Signature Verifier delegation
    const signatureValid = this.signatureVerifier.verifySignature(context.config.pluginId, signature);
    if (signature && !signatureValid) {
      throw new TrustValidationError(
        'TRUST_SIGNATURE_INVALID',
        `Signature validation failed for plugin '${context.config.pluginId}'.`
      );
    }

    // 2. TrustEvidence structure compilation
    const evidence: TrustEvidence = {
      monitoringView,
      signatureValid,
      pluginId: context.config.pluginId,
      projectId: context.workspaceContext.projectId
    };

    // 3. TrustEvaluator pure evaluation call
    const evaluation = this.evaluator.evaluate(evidence);

    // 4. Decision policy logic
    if (evaluation.score.level === 'untrusted') {
      throw new TrustValidationError(
        'TRUST_SCORE_INSUFFICIENT',
        `Score ${evaluation.score.value} is below standard sandbox threshold (${TrustPolicy.MINIMUM_SANDBOX_SCORE}).`
      );
    }

    return {
      decision: 'allow',
      evaluation
    };
  }
}
