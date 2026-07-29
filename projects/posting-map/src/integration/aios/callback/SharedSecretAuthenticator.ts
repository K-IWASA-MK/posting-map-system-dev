/**
 * SharedSecretAuthenticator.ts
 * Basic implementation of CallbackAuthenticator using a shared secret.
 */
import { CallbackAuthenticator } from './CallbackAuthenticator';
import { CallbackContext } from './CallbackContext';

export class SharedSecretAuthenticator implements CallbackAuthenticator {
  private readonly secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.AIOS_CALLBACK_SECRET || 'default-secret';
  }

  authenticate(context: CallbackContext, payload: unknown): boolean {
    const authHeader = context.headers?.['authorization'] || context.headers?.['x-api-key'];
    if (!authHeader) return false;

    // Simple matching for foundation phase
    return authHeader === `Bearer ${this.secret}` || authHeader === this.secret;
  }
}
