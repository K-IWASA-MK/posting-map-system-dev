export interface SecretProvider {
  getSecret(key: string): Promise<string> | string;
}

export class SecretAccessPolicy {
  private readonly provider: SecretProvider;
  private readonly allowedKeys = new Set<string>(["AUTONOMOUS_TRIGGER_SECRET", "GIT_SSH_KEY", "STRIPE_API_KEY"]);

  constructor(provider: SecretProvider) {
    this.provider = provider;
  }

  /**
   * Safe access to secret store.
   * Asserts request key is within allowed boundary and returns it.
   */
  public async getSecret(key: string, requester: string): Promise<string> {
    if (!this.allowedKeys.has(key)) {
      throw new Error(`Security Block: Requester ${requester} attempted to access unauthorized secret key: ${key}`);
    }

    // In a production app, we would audit the secret access here
    const secret = await this.provider.getSecret(key);
    if (!secret) {
      throw new Error(`SecretAccessError: Key ${key} not found in provider.`);
    }

    return secret;
  }
}
