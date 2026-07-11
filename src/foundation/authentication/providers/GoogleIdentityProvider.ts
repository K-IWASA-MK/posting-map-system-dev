import { ApiRequest } from '@core/api/ApiRequest';
import { IdentityProvider } from '../IdentityProvider';
import { AuthenticationResult } from '../AuthenticationResult';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from '../AuthenticationContext';

declare const Session: any;

export class GoogleIdentityProvider implements IdentityProvider {
  public authenticate(request: ApiRequest): AuthenticationResult {
    let email = '';

    try {
      if (typeof Session !== 'undefined' && Session.getActiveUser) {
        email = Session.getActiveUser().getEmail();
      }
    } catch (e) {
      // Ignored
    }

    if (!email || email.trim().length === 0) {
      return AuthenticationResult.failureResult('Google user is not authenticated via Session.');
    }

    const context = new AuthenticationContext({
      identityId: email,
      identityType: IdentityType.USER,
      authenticationMethod: AuthenticationMethod.GOOGLE,
      authenticated: true,
      issuedAt: Date.now(),
      metadata: {
        provider: 'GoogleIdentityProvider',
        email: email
      }
    });

    return AuthenticationResult.successResult(context);
  }
}
