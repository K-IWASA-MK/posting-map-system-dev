import { ISignatureVerifier } from './ISignatureVerifier';

/**
 * SignatureVerifier implements signature verification checks.
 */
export class SignatureVerifier implements ISignatureVerifier {
  /**
   * Verifies mock signature rules.
   */
  public verifySignature(pluginId: string, signature?: string): boolean {
    if (!signature) {
      return false;
    }
    return signature === 'valid-sig-123';
  }
}
