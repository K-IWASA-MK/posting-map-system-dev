import { Role } from './Role';
import { Permission } from './Permission';
import { Scope } from './Scope';
import { ApiRequest } from '../api/ApiRequest';

export class AuthorizationPolicy {
  public readonly requiredRoles: Role[];
  public readonly requiredPermissions: Permission[];
  public readonly requiredScopes: Scope[];

  constructor(params: {
    requiredRoles?: Role[];
    requiredPermissions?: Permission[];
    requiredScopes?: Scope[];
  }) {
    this.requiredRoles = params.requiredRoles || [];
    this.requiredPermissions = params.requiredPermissions || [];
    this.requiredScopes = params.requiredScopes || [];
  }

  /**
   * Resolves the required policy rules based on requested path/action.
   * Centralized mapping that feeds rules into the pipeline checks.
   */
  public static resolve(request: ApiRequest): AuthorizationPolicy {
    // 1. Admin paths require ADMIN role and permission
    if (request.path === '/admin' || (request.query && request.query.action === 'resetAllSheets')) {
      return new AuthorizationPolicy({
        requiredRoles: [Role.ADMIN, Role.SYSTEM],
        requiredPermissions: [Permission.ADMIN]
      });
    }

    // 2. Write paths require MEMBER role and WRITE permission
    if (request.method === 'POST') {
      return new AuthorizationPolicy({
        requiredRoles: [Role.SYSTEM, Role.ADMIN, Role.LEADER, Role.MEMBER],
        requiredPermissions: [Permission.WRITE]
      });
    }

    // 3. Health paths don't require specific permissions
    if (request.path === '/health') {
      return new AuthorizationPolicy({});
    }

    // 4. Default policy for other requests: read access
    return new AuthorizationPolicy({
      requiredPermissions: [Permission.READ]
    });
  }
}
