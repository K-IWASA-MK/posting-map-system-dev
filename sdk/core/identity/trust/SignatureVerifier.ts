import { DigitalIdentity } from '../IdentityModels';

export class SignatureVerifier {
  public verifySignature(data: string, signature: string, publicKey: string): boolean {
    if (!data || !signature || !publicKey) return false;
    
    // Check if key is expired/invalid mock flag
    if (publicKey.includes('EXPIRED') || publicKey.includes('REVOKED')) {
      return false;
    }

    // Deterministic mock verification: signature must match deterministic hash of (data + publicKey)
    const expected = this.computeMockSignature(data, publicKey);
    return signature === expected;
  }

  public computeMockSignature(data: string, publicKey: string): string {
    const raw = `${data}:${publicKey}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `SIG-${Math.abs(hash)}`;
  }
}
