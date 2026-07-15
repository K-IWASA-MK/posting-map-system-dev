/**
 * ISignatureVerifier abstracts cryptographic verification of plugin signatures.
 */
export interface ISignatureVerifier {
  /**
   * Verifies the signature of the plugin.
   * @param pluginId Target plugin ID.
   * @param signature Cryptographic payload signature.
   */
  verifySignature(pluginId: string, signature?: string): boolean;
}
