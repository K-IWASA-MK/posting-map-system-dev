import { Resolver } from './Resolver';
import { AuthenticationContext } from '@foundation/authentication/AuthenticationContext';
import { Scope } from './Scope';
import { Role } from './Role';
import { RoleResolver } from './RoleResolver';

/**
 * ScopeResolver - ロールに応じた管轄データ範囲割り当てスタブ (Stub Only)
 */
export class ScopeResolver implements Resolver<Scope[]> {
  private roleResolver = new RoleResolver();

  public resolve(authContext: AuthenticationContext): Scope[] {
    const role = this.roleResolver.resolve(authContext);

    if (role === Role.SYSTEM) {
      return [Scope.SYSTEM];
    }
    if (role === Role.ADMIN) {
      return [Scope.ORGANIZATION];
    }
    if (role === Role.LEADER) {
      return [Scope.BRANCH];
    }
    if (role === Role.MEMBER) {
      return [Scope.AREA];
    }

    return [Scope.SELF];
  }
}
