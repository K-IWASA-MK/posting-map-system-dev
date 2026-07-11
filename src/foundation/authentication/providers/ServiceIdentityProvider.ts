import { ApiRequest } from '@core/api/ApiRequest';
import { IdentityProvider } from '../IdentityProvider';
import { AuthenticationResult } from '../AuthenticationResult';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from '../AuthenticationContext';

/**
 * ServiceIdentityProvider - 内部サービス認証用の開発用スタブ (Stub Only)
 * ※Production実装では AIOS Bridge 署名検証等に差し替えられます。
 */
export class ServiceIdentityProvider implements IdentityProvider {
  public authenticate(request: ApiRequest): AuthenticationResult {
    const serviceAuth = request.headers?.['x-service-auth'];

    if (!serviceAuth) {
      return AuthenticationResult.failureResult('Service auth header missing');
    }

    if (serviceAuth === 'valid-service-key') {
      const context = new AuthenticationContext({
        identityId: 'service-aios-bridge-stub',
        identityType: IdentityType.SERVICE,
        authenticationMethod: AuthenticationMethod.INTERNAL_SERVICE,
        authenticated: true,
        issuedAt: Date.now(),
        metadata: {
          provider: 'ServiceIdentityProvider',
          stub: true
        }
      });
      return AuthenticationResult.successResult(context);
    }

    return AuthenticationResult.failureResult('Invalid Service Auth Key');
  }
}
