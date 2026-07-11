import { Resolver } from './Resolver';
import { AuthenticationContext } from '@foundation/authentication/AuthenticationContext';
import { Permission } from './Permission';
import { Role } from './Role';
import { RoleResolver } from './RoleResolver';

/**
 * PermissionResolver - ロールに応じた権限割り当てスタブ (Stub Only)
 */
export class PermissionResolver implements Resolver<Permission[]> {
  private roleResolver = new RoleResolver();

  public resolve(authContext: AuthenticationContext): Permission[] {
    const role = this.roleResolver.resolve(authContext);

    if (role === Role.SYSTEM || role === Role.ADMIN) {
      return [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.EXPORT, Permission.ADMIN];
    }
    if (role === Role.LEADER) {
      return [Permission.READ, Permission.WRITE, Permission.EXPORT];
    }
    if (role === Role.MEMBER) {
      return [Permission.READ, Permission.WRITE];
    }

    return [Permission.READ];
  }
}
