import { AuthenticationContext } from '../authentication/AuthenticationContext';
import { Resolver } from './Resolver';
import { Role } from './Role';

/**
 * RoleResolver - 開発用ロールマッピングスタブ (Stub Only)
 */
export class RoleResolver implements Resolver<Role> {
  public resolve(authContext: AuthenticationContext): Role {
    if (!authContext.authenticated) {
      return Role.VIEWER;
    }

    const id = authContext.identityId;

    if (id === 'service-aios-bridge-stub') {
      return Role.SYSTEM;
    }
    if (id === 'user-api-key-stub') {
      return Role.ADMIN;
    }
    if (id === 'user-liff-stub-123') {
      return Role.MEMBER;
    }

    return Role.VIEWER;
  }
}
