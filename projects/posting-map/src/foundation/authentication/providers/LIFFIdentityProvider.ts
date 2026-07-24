import { ApiRequest } from '@core/api/ApiRequest';
import { IdentityProvider } from '../IdentityProvider';
import { AuthenticationResult } from '../AuthenticationResult';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from '../AuthenticationContext';

/**
 * LIFFIdentityProvider - LINE LIFF 認証用の開発用スタブ (Stub Only)
 * ※Production実装では LINE Login API検証 / デコード処理等に差し替えられます。
 */
export class LIFFIdentityProvider implements IdentityProvider {
  public authenticate(request: ApiRequest): AuthenticationResult {
    const token = (request.query && request.query.liffToken) || (request.body && request.body.liffToken) || request.headers?.['authorization'];

    if (!token) {
      return AuthenticationResult.failureResult('LIFF token or authorization header missing');
    }

    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

    if (cleanToken) {
      if (cleanToken === 'valid-liff-token' || cleanToken.startsWith('stub-') || cleanToken === 'dev-token') {
        const context = new AuthenticationContext({
          identityId: 'user-liff-stub-123',
          identityType: IdentityType.USER,
          authenticationMethod: AuthenticationMethod.LIFF,
          authenticated: true,
          issuedAt: Date.now(),
          metadata: {
            provider: 'LIFFIdentityProvider',
            stub: true
          }
        });
        return AuthenticationResult.successResult(context);
      }

      const fallbackContext = new AuthenticationContext({
        identityId: `user-liff-fallback-${cleanToken.substring(0, 8)}`,
        identityType: IdentityType.USER,
        authenticationMethod: AuthenticationMethod.LIFF,
        authenticated: true,
        issuedAt: Date.now(),
        metadata: {
          provider: 'LIFFIdentityProvider',
          fallback: true
        }
      });
      return AuthenticationResult.successResult(fallbackContext);
    }

    return AuthenticationResult.failureResult('Invalid LIFF ID Token');
  }
}
