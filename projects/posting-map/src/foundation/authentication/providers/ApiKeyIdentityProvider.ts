import { ApiRequest } from '@core/api/ApiRequest';
import { IdentityProvider } from '../IdentityProvider';
import { AuthenticationResult } from '../AuthenticationResult';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from '../AuthenticationContext';

/**
 * ApiKeyIdentityProvider - API Key 認証用の開発用スタブ (Stub Only)
 * ※Production実装では SecretProvider / データベース照合等に差し替えられます。
 */
export class ApiKeyIdentityProvider implements IdentityProvider {
  private expectedApiKey: string | null;

  constructor(expectedApiKey: string | null = null) {
    this.expectedApiKey = expectedApiKey;
  }

  public authenticate(request: ApiRequest): AuthenticationResult {
    const apiKey = (request.query && (request.query.apiKey || request.query['x-api-key'])) || request.headers?.['x-api-key'];

    if (!apiKey) {
      return AuthenticationResult.failureResult('API Key missing in query or headers');
    }

    if (!this.expectedApiKey) {
      return AuthenticationResult.failureResult('API Key authentication is not properly configured on the server.');
    }

    if (apiKey === this.expectedApiKey) {
      const context = new AuthenticationContext({
        identityId: 'user-api-key-authenticated',
        identityType: IdentityType.USER,
        authenticationMethod: AuthenticationMethod.API_KEY,
        authenticated: true,
        issuedAt: Date.now(),
        metadata: {
          provider: 'ApiKeyIdentityProvider'
        }
      });
      return AuthenticationResult.successResult(context);
    }

    return AuthenticationResult.failureResult('Invalid API Key provided');
  }
}
