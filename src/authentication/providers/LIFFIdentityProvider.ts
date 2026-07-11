import { ApiRequest } from '../../api/ApiRequest';
import { IdentityProvider } from '../IdentityProvider';
import { AuthenticationResult } from '../AuthenticationResult';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from '../AuthenticationContext';

/**
 * LIFFIdentityProvider - LINE LIFF 認証用の開発用スタブ (Stub Only)
 * ※Production実装では LINE Login API検証 / デコード処理等に差し替えられます。
 */
export class LIFFIdentityProvider implements IdentityProvider {
  public authenticate(request: ApiRequest): AuthenticationResult {
    const token = (request.query && request.query.liffToken) || request.headers?.['authorization'];

    if (!token) {
      return AuthenticationResult.failureResult('LIFF token or authorization header missing');
    }

    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

    if (cleanToken === 'valid-liff-token') {
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

    return AuthenticationResult.failureResult('Invalid LIFF ID Token');
  }
}
