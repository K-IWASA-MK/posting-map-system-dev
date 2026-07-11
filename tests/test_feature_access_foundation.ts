import { ApiRequest } from '../src/api/ApiRequest';
import { ApiExecutionContext } from '../src/gas/ApiExecutionContext';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from '../src/authentication/AuthenticationContext';
import { Role } from '../src/authorization/Role';
import { Permission } from '../src/authorization/Permission';
import { Scope } from '../src/authorization/Scope';
import { AuthorizationContext } from '../src/authorization/AuthorizationContext';
import { Edition } from '../src/licensing/Edition';
import { LicenseStatus } from '../src/licensing/LicenseStatus';
import { LicenseContext } from '../src/licensing/LicenseContext';
import { Feature } from '../src/features/Feature';
import { FeatureAvailability } from '../src/features/FeatureAvailability';
import { FeaturePolicy } from '../src/features/FeaturePolicy';
import { FeatureRegistry } from '../src/features/FeatureRegistry';
import { FeatureResolver } from '../src/features/FeatureResolver';
import { FeatureAccessPipeline } from '../src/features/FeatureAccessPipeline';
import { FeatureException } from '../src/exceptions/FeatureException';
import { GasConfigurationProvider } from '../src/gas/GasConfigurationProvider';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test Feature] Starting Feature Access Control Foundation tests...');

  // 1. Registry static mapping checks
  {
    const policyDash = FeatureRegistry.get(Feature.REALTIME_DASHBOARD);
    assert(policyDash !== null, 'REALTIME_DASHBOARD policy should exist');
    assert(policyDash?.requiredEdition === Edition.STANDARD, 'Dashboard should require STANDARD edition');
    assert(policyDash?.featureToggle === 'flyerHolding', 'Dashboard toggle flag mismatch');

    const policyExport = FeatureRegistry.get(Feature.EXPORT);
    assert(policyExport?.requiredEdition === Edition.PROFESSIONAL, 'Export should require PROFESSIONAL');

    console.log('[Test Feature] Registry static map: PASSED');
  }

  // 2. Resolver routing matching
  {
    const reqDash = new ApiRequest({ method: 'GET', path: '/dashboard', version: 'v2', requestId: 'req-fea-1' });
    assert(FeatureResolver.resolveFeature(reqDash) === Feature.REALTIME_DASHBOARD, 'Path /dashboard resolver failed');

    const reqExport = new ApiRequest({ method: 'GET', path: '/test', query: { action: 'export' }, version: 'v2', requestId: 'req-fea-2' });
    assert(FeatureResolver.resolveFeature(reqExport) === Feature.EXPORT, 'Query action export resolver failed');

    console.log('[Test Feature] Feature resolver route matching: PASSED');
  }

  // 3. Pipeline validations
  {
    const pipeline = FeatureAccessPipeline.getInstance();

    // 3.1 Toggle off verification: throws FEATURE_DISABLED (PM-FEA-001)
    const configInstance = GasConfigurationProvider.getInstance();
    const originalGetFeatureFlags = configInstance.getFeatureFlags;
    const originalFlags = originalGetFeatureFlags.call(configInstance);

    // Mock flyerHolding = false
    configInstance.getFeatureFlags = () => ({
      ...originalFlags,
      flyerHolding: false
    });

    const context = new ApiExecutionContext();
    context.setAuthenticationContext(new AuthenticationContext({
      identityId: 'user-api-key-stub', // ADMIN -> PROFESSIONAL -> ACTIVE
      identityType: IdentityType.USER,
      authenticationMethod: AuthenticationMethod.API_KEY,
      authenticated: true,
      issuedAt: Date.now()
    }));
    context.setAuthorizationContext(new AuthorizationContext({
      role: Role.ADMIN,
      permissions: [Permission.READ, Permission.WRITE, Permission.ADMIN],
      scopes: [Scope.ORGANIZATION],
      authorized: true
    }));
    context.setLicenseContext(new LicenseContext({
      edition: Edition.PROFESSIONAL,
      status: LicenseStatus.ACTIVE,
      licensed: true,
      expiresAt: Date.now() + 100000,
      issuedAt: Date.now()
    }));

    const reqDash = new ApiRequest({ method: 'GET', path: '/dashboard', version: 'v2', requestId: 'req-fea-3' });

    let toggleDisabledThrew = false;
    try {
      pipeline.execute(reqDash, context);
    } catch (e) {
      if (e instanceof FeatureException) {
        toggleDisabledThrew = true;
        assert(e.code === 'PM-FEA-001', 'Expected Feature Disabled code PM-FEA-001');
      }
    }
    assert(toggleDisabledThrew === true, 'Disabled toggle feature did not block execution');

    // Restore feature toggles
    configInstance.getFeatureFlags = originalGetFeatureFlags;

    // 3.2 Edition Plan check: COMMUNITY accessing /dashboard (STANDARD required) throws LICENSE_REQUIRED (PM-FEA-002)
    const contextLowPlan = new ApiExecutionContext();
    contextLowPlan.setLicenseContext(new LicenseContext({
      edition: Edition.COMMUNITY, // Low plan
      status: LicenseStatus.ACTIVE,
      licensed: true,
      expiresAt: Date.now() + 100000,
      issuedAt: Date.now()
    }));

    let lowPlanThrew = false;
    try {
      pipeline.execute(reqDash, contextLowPlan);
    } catch (e) {
      if (e instanceof FeatureException) {
        lowPlanThrew = true;
        assert(e.code === 'PM-FEA-002', 'Expected License Required code PM-FEA-002');
      }
    }
    assert(lowPlanThrew === true, 'Low plan edition access did not throw license validation exception');

    // 3.3 Authorization Checks: MEMBER accessing EXPORT (requires EXPORT permission) throws PERMISSION_REQUIRED (PM-FEA-003)
    const contextMember = new ApiExecutionContext();
    contextMember.setLicenseContext(new LicenseContext({
      edition: Edition.PROFESSIONAL,
      status: LicenseStatus.ACTIVE,
      licensed: true,
      expiresAt: Date.now() + 100000,
      issuedAt: Date.now()
    }));
    contextMember.setAuthorizationContext(new AuthorizationContext({
      role: Role.MEMBER,
      permissions: [Permission.READ, Permission.WRITE], // No EXPORT permission
      scopes: [Scope.AREA],
      authorized: true
    }));

    const reqExport = new ApiRequest({ method: 'GET', path: '/export', version: 'v2', requestId: 'req-fea-4' });

    let permThrew = false;
    try {
      pipeline.execute(reqExport, contextMember);
    } catch (e) {
      if (e instanceof FeatureException) {
        permThrew = true;
        assert(e.code === 'PM-FEA-003', 'Expected Permission Required code PM-FEA-003');
      }
    }
    assert(permThrew === true, 'Access without required permission did not throw exception');

    // 3.4 Valid access saves Context
    const contextAdmin = new ApiExecutionContext();
    contextAdmin.setLicenseContext(new LicenseContext({
      edition: Edition.PROFESSIONAL,
      status: LicenseStatus.ACTIVE,
      licensed: true,
      expiresAt: Date.now() + 100000,
      issuedAt: Date.now()
    }));
    contextAdmin.setAuthorizationContext(new AuthorizationContext({
      role: Role.ADMIN,
      permissions: [Permission.READ, Permission.WRITE, Permission.EXPORT, Permission.ADMIN],
      scopes: [Scope.ORGANIZATION],
      authorized: true
    }));

    pipeline.execute(reqExport, contextAdmin);
    const featContext = contextAdmin.getFeatureContext();
    assert(featContext !== null, 'FeatureContext should be bound to execution context');
    assert(featContext?.feature === Feature.EXPORT, 'Incorrect feature bound');
    assert(featContext?.availability === FeatureAvailability.AVAILABLE, 'Availability should be AVAILABLE');
    assert(featContext?.enabled === true, 'Feature enabled state should be true');

    console.log('[Test Feature] Pipeline validations execution: PASSED');
  }

  console.log('[Test Feature] All Feature Access Control Foundation tests completed.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  FEATURE ACCESS CONTROL PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[Feature Test Failure]', err);
  if (typeof (globalThis as any).process !== 'undefined') {
    (globalThis as any).process.exit(1);
  }
});
