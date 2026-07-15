/**
 * TrustErrorCode describes trust and signature validation failure categories.
 */
export type TrustErrorCode =
  | 'TRUST_VERIFICATION_DENIED'
  | 'TRUST_SIGNATURE_INVALID'
  | 'TRUST_SCORE_INSUFFICIENT';

/**
 * TrustValidationError is thrown when project or plugin trust level evaluation fails verification limits.
 */
export class TrustValidationError extends Error {
  public readonly errorCode: TrustErrorCode;

  constructor(errorCode: TrustErrorCode, message: string) {
    super(`[${errorCode}] ${message}`);
    this.name = 'TrustValidationError';
    this.errorCode = errorCode;
  }
}
