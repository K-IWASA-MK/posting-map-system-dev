import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from '@foundation/authentication/AuthenticationContext';
import { RoleResolver } from './RoleResolver';
import { PermissionResolver } from './PermissionResolver';
import { ScopeResolver } from './ScopeResolver';
import { AuthorizationContext } from './AuthorizationContext';
import { AuthorizationPolicy } from './AuthorizationPolicy';
import { AuthorizationException } from '@core/exceptions/AuthorizationException';
import { GasConfigurationProvider } from '@infra/gas/GasConfigurationProvider';

export class AuthorizationPipeline {
  private static instance: AuthorizationPipeline | null = null;

  private roleResolver = new RoleResolver();
  private permissionResolver = new PermissionResolver();
  private scopeResolver = new ScopeResolver();

  private constructor() {}

  public static getInstance(): AuthorizationPipeline {
    if (!AuthorizationPipeline.instance) {
      AuthorizationPipeline.instance = new AuthorizationPipeline();
    }
    return AuthorizationPipeline.instance;
  }

  public execute(request: ApiRequest, context: ApiExecutionContext): void {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    // 1. Fetch Authentication Context (Fallback to anonymous if missing)
    let authContext = context.getAuthenticationContext();
    if (!authContext) {
      authContext = new AuthenticationContext({
        identityId: 'anonymous',
        identityType: IdentityType.ANONYMOUS,
        authenticationMethod: AuthenticationMethod.NONE,
        authenticated: false,
        issuedAt: Date.now()
      });
    }

    // 2. Resolve Role, Permissions, and Scopes
    const role = this.roleResolver.resolve(authContext);
    const permissions = this.permissionResolver.resolve(authContext);
    const scopes = this.scopeResolver.resolve(authContext);

    const authzContext = new AuthorizationContext({
      role,
      permissions,
      scopes,
      authorized: true,
      metadata: {
        decisionSource: 'AuthorizationPipeline',
        evaluationTime: Date.now()
      }
    });

    context.setAuthorizationContext(authzContext);

    // 3. Check feature toggle
    if (flags.authorizationEnabled === false) {
      return;
    }

    // 4. Policy validation (Fail-fast verification)
    const policy = AuthorizationPolicy.resolve(request);

    // 4.1 Role Check
    if (flags.roleValidation !== false && policy.requiredRoles.length > 0) {
      if (!policy.requiredRoles.includes(role)) {
        throw new AuthorizationException(
          'PM-AUTHZ-002',
          `Required role not met. Allowed roles: ${policy.requiredRoles.join(', ')}`,
          request.requestId
        );
      }
    }

    // 4.2 Permission Check
    if (flags.permissionValidation !== false && policy.requiredPermissions.length > 0) {
      const hasAllPermissions = policy.requiredPermissions.every(p => permissions.includes(p));
      if (!hasAllPermissions) {
        throw new AuthorizationException(
          'PM-AUTHZ-003',
          `Required permissions not met. Required: ${policy.requiredPermissions.join(', ')}`,
          request.requestId
        );
      }
    }

    // 4.3 Scope Check
    if (flags.scopeValidation !== false && policy.requiredScopes.length > 0) {
      const hasAllScopes = policy.requiredScopes.every(s => scopes.includes(s));
      if (!hasAllScopes) {
        throw new AuthorizationException(
          'PM-AUTHZ-004',
          `Required data boundary scopes not met. Required: ${policy.requiredScopes.join(', ')}`,
          request.requestId
        );
      }
    }
  }
}
