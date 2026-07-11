import { AuthenticationContext } from '../authentication/AuthenticationContext';
import { Resolver } from '../authorization/Resolver';
import { Edition } from './Edition';

/**
 * EditionResolver - 開発用エディション解決スタブ (Stub Only)
 */
export class EditionResolver implements Resolver<Edition> {
  public resolve(authContext: AuthenticationContext): Edition {
    const id = authContext.identityId;

    if (id === 'service-aios-bridge-stub') {
      return Edition.ENTERPRISE;
    }
    if (id === 'user-api-key-stub') {
      return Edition.PROFESSIONAL;
    }
    if (id === 'user-liff-stub-123') {
      return Edition.STANDARD;
    }

    return Edition.COMMUNITY;
  }
}
