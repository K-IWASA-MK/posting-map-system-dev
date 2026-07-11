import { ApiRequest } from '../src/api/ApiRequest';
import { ApiExecutionContext } from '../src/gas/ApiExecutionContext';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from '../src/authentication/AuthenticationContext';
import { Role } from '../src/authorization/Role';
import { Permission } from '../src/authorization/Permission';
import { Scope } from '../src/authorization/Scope';
import { RoleResolver } from '../src/authorization/RoleResolver';
import { PermissionResolver } from '../src/authorization/PermissionResolver';
import { ScopeResolver } from '../src/authorization/ScopeResolver';
import { AuthorizationPolicy } from '../src/authorization/AuthorizationPolicy';
import { AuthorizationPipeline } from '../src/authorization/AuthorizationPipeline';
import { AuthorizationException } from '../src/exceptions/AuthorizationException';
import { GasConfigurationProvider } from '../src/gas/GasConfigurationProvider';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test Authz] Starting Authorization Foundation tests...');

  // 1. Resolver Stub Mapping Checks
  {
    const roleResolver = new RoleResolver();
    const permResolver = new PermissionResolver();
    const scopeResolver = new ScopeResolver();

    // 1.1 Admin mapping
    const authAdmin = new AuthenticationContext({
      identityId: 'user-api-key-stub',
      identityType: IdentityType.USER,
      authenticationMethod: AuthenticationMethod.API_KEY,
      authenticated: true,
      issuedAt: Date.now()
    });
    assert(roleResolver.resolve(authAdmin) === Role.ADMIN, 'Admin role mapping failed');
    assert(permResolver.resolve(authAdmin).includes(Permission.ADMIN), 'Admin permission mapping failed');
    assert(scopeResolver.resolve(authAdmin).includes(Scope.ORGANIZATION), 'Admin scope mapping failed');

    // 1.2 Member mapping
    const authMember = new AuthenticationContext({
      identityId: 'user-liff-stub-123',
      identityType: IdentityType.USER,
      authenticationMethod: AuthenticationMethod.LIFF,
      authenticated: true,
      issuedAt: Date.now()
    });
    assert(roleResolver.resolve(authMember) === Role.MEMBER, 'Member role mapping failed');
    assert(permResolver.resolve(authMember).includes(Permission.WRITE), 'Member permission mapping failed');
    assert(!permResolver.resolve(authMember).includes(Permission.ADMIN), 'Member should not have ADMIN permission');
    assert(scopeResolver.resolve(authMember).includes(Scope.AREA), 'Member scope mapping failed');

    // 1.3 Anonymous mapping
    const authAnon = new AuthenticationContext({
      identityId: 'anonymous',
      identityType: IdentityType.ANONYMOUS,
      authenticationMethod: AuthenticationMethod.NONE,
      authenticated: false,
      issuedAt: Date.now()
    });
    assert(roleResolver.resolve(authAnon) === Role.VIEWER, 'Anonymous role mapping failed');
    assert(permResolver.resolve(authAnon).includes(Permission.READ), 'Anonymous read permission failed');
    assert(!permResolver.resolve(authAnon).includes(Permission.WRITE), 'Anonymous should not write');

    console.log('[Test Authz] Resolvers mapping stubs: PASSED');
  }

  // 2. Policy Resolver Routing Rules Checks
  {
    const reqAdmin = new ApiRequest({ method: 'GET', path: '/admin', version: 'v2', requestId: 'req-authz-1' });
    const policyAdmin = AuthorizationPolicy.resolve(reqAdmin);
    assert(policyAdmin.requiredRoles.includes(Role.ADMIN), 'Admin path should require ADMIN role');
    assert(policyAdmin.requiredPermissions.includes(Permission.ADMIN), 'Admin path should require ADMIN permission');

    const reqWrite = new ApiRequest({ method: 'POST', path: '/dashboard', version: 'v2', requestId: 'req-authz-2' });
    const policyWrite = AuthorizationPolicy.resolve(reqWrite);
    assert(policyWrite.requiredPermissions.includes(Permission.WRITE), 'POST request should require WRITE permission');

    const reqHealth = new ApiRequest({ method: 'GET', path: '/health', version: 'v2', requestId: 'req-authz-3' });
    const policyHealth = AuthorizationPolicy.resolve(reqHealth);
    assert(policyHealth.requiredRoles.length === 0, 'Health check path should not require specific roles');

    console.log('[Test Authz] Policy resolver routing rules: PASSED');
  }

  // 3. Pipeline execution with policies
  {
    const pipeline = AuthorizationPipeline.getInstance();

    // 3.1 MEMBER role trying to access ADMIN endpoint (/admin) fails with ROLE_REQUIRED
    const context = new ApiExecutionContext();
    const authMember = new AuthenticationContext({
      identityId: 'user-liff-stub-123', // MEMBER role resolved
      identityType: IdentityType.USER,
      authenticationMethod: AuthenticationMethod.LIFF,
      authenticated: true,
      issuedAt: Date.now()
    });
    context.setAuthenticationContext(authMember);

    const reqAdmin = new ApiRequest({ method: 'GET', path: '/admin', version: 'v2', requestId: 'req-authz-4' });

    let roleErrorThrew = false;
    try {
      pipeline.execute(reqAdmin, context);
    } catch (e) {
      if (e instanceof AuthorizationException) {
        roleErrorThrew = true;
        assert(e.code === 'PM-AUTHZ-002', 'Expected Role Required code PM-AUTHZ-002');
      }
    }
    assert(roleErrorThrew === true, 'Under-privileged role request did not throw role validation error');

    // 3.2 ADMIN role accessing ADMIN endpoint (/admin) succeeds
    const contextAdmin = new ApiExecutionContext();
    const authAdmin = new AuthenticationContext({
      identityId: 'user-api-key-stub', // ADMIN role resolved
      identityType: IdentityType.USER,
      authenticationMethod: AuthenticationMethod.API_KEY,
      authenticated: true,
      issuedAt: Date.now()
    });
    contextAdmin.setAuthenticationContext(authAdmin);

    let adminThrew = false;
    try {
      pipeline.execute(reqAdmin, contextAdmin);
    } catch (e) {
      adminThrew = true;
    }
    assert(adminThrew === false, 'ADMIN role was rejected from /admin endpoint');

    // 3.3 Authorization Context is mapped into the Execution Context
    const authzContext = contextAdmin.getAuthorizationContext();
    assert(authzContext !== null, 'AuthorizationContext should be bound to execution context');
    assert(authzContext?.role === Role.ADMIN, 'Incorrect role set inside context');
    assert(authzContext?.authorized === true, 'Authorized context flag should be true');

    // 3.4 Pipeline disabled bypasses policy checking
    const configInstance = GasConfigurationProvider.getInstance();
    const originalGetFeatureFlags = configInstance.getFeatureFlags;
    const originalFlags = originalGetFeatureFlags.call(configInstance);

    configInstance.getFeatureFlags = () => ({
      ...originalFlags,
      authorizationEnabled: false
    });

    let bypassSuccess = false;
    try {
      pipeline.execute(reqAdmin, context); // MEMBER context originally fails, but now bypasses
      bypassSuccess = true;
    } catch (e) {
      bypassSuccess = false;
    }
    assert(bypassSuccess === true, 'Bypassed authentication pipeline still threw exception');

    // Restore feature flag defaults
    configInstance.getFeatureFlags = originalGetFeatureFlags;

    console.log('[Test Authz] AuthorizationPipeline validation execution: PASSED');
  }

  console.log('[Test Authz] All Authorization Foundation tests completed.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  AUTHORIZATION FOUNDATION PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[Authorization Test Failure]', err);
  if (typeof (globalThis as any).process !== 'undefined') {
    (globalThis as any).process.exit(1);
  }
});
