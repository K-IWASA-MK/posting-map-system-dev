import { CapabilityToken } from './SecurityModels';

export class SecurityPolicyRegistry {
  private tokens = new Map<string, CapabilityToken>();
  private secrets = new Map<string, string>(); // mock secure secret vault

  constructor() {
    this.secrets.set('DB_CONN_STRING', 'mongodb://localhost:27017/aios');
    this.secrets.set('API_KEY_SECURE', 'sk-proj-securekey123456');
  }

  public registerToken(token: CapabilityToken): void {
    this.tokens.set(token.tokenId, token);
  }

  public getToken(tokenId: string): CapabilityToken | undefined {
    return this.tokens.get(tokenId);
  }

  public revokeToken(tokenId: string): void {
    const t = this.tokens.get(tokenId);
    if (t) {
      this.tokens.set(tokenId, {
        ...t,
        revoked: true
      });
    }
  }

  public getSecretValue(secretId: string): string | undefined {
    return this.secrets.get(secretId);
  }
}
