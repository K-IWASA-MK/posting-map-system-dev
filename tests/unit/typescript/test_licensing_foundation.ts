import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from '@foundation/authentication/AuthenticationContext';
import { Edition, EditionRank } from '@foundation/licensing/Edition';
import { LicenseStatus } from '@foundation/licensing/LicenseStatus';
import { EditionResolver } from '@foundation/licensing/EditionResolver';
import { LicenseResolver } from '@foundation/licensing/LicenseResolver';
import { LicensePolicy } from '@foundation/licensing/LicensePolicy';
import { LicensingPipeline } from '@foundation/licensing/LicensingPipeline';
import { LicenseException } from '@core/exceptions/LicenseException';
import { GasConfigurationProvider } from '@infra/gas/GasConfigurationProvider';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test Lic] Starting Licensing Foundation tests...');

  // 1. Resolver Mapping Checks
  {
    const editionResolver = new EditionResolver();
    const licenseResolver = new LicenseResolver();

    // 1.1 API Key -> PROFESSIONAL
    const authAdmin = new AuthenticationContext({
      identityId: 'user-api-key-stub',
      identityType: IdentityType.USER,
      authenticationMethod: AuthenticationMethod.API_KEY,
      authenticated: true,
      issuedAt: Date.now()
    });
    assert(editionResolver.resolve(authAdmin) === Edition.PROFESSIONAL, 'Admin edition resolve failed');
    const ctxAdmin = licenseResolver.resolve(authAdmin);
    assert(ctxAdmin.edition === Edition.PROFESSIONAL, 'License context edition mismatch');
    assert(ctxAdmin.status === LicenseStatus.ACTIVE, 'License status mismatch');
    assert(ctxAdmin.licensed === true, 'Licensed flag should be true');

    // 1.2 LIFF -> STANDARD
    const authMember = new AuthenticationContext({
      identityId: 'user-liff-stub-123',
      identityType: IdentityType.USER,
      authenticationMethod: AuthenticationMethod.LIFF,
      authenticated: true,
      issuedAt: Date.now()
    });
    assert(editionResolver.resolve(authMember) === Edition.STANDARD, 'Member edition resolve failed');

    // 1.3 Anonymous -> COMMUNITY
    const authAnon = new AuthenticationContext({
      identityId: 'anonymous',
      identityType: IdentityType.ANONYMOUS,
      authenticationMethod: AuthenticationMethod.NONE,
      authenticated: false,
      issuedAt: Date.now()
    });
    assert(editionResolver.resolve(authAnon) === Edition.COMMUNITY, 'Anonymous edition resolve failed');

    console.log('[Test Lic] Resolvers mapping stubs: PASSED');
  }

  // 2. Policy rules mapping Checks
  {
    const reqReset = new ApiRequest({ method: 'POST', path: '/admin', query: { action: 'resetAllSheets' }, version: 'v2', requestId: 'req-lic-1' });
    const policyReset = LicensePolicy.resolve(reqReset);
    assert(policyReset.requiredEdition === Edition.ENTERPRISE, 'Reset action must require ENTERPRISE edition');

    const reqDash = new ApiRequest({ method: 'GET', path: '/dashboard', version: 'v2', requestId: 'req-lic-2' });
    const policyDash = LicensePolicy.resolve(reqDash);
    assert(policyDash.requiredEdition === Edition.STANDARD, 'Dashboard path must require STANDARD edition');

    console.log('[Test Lic] Policy resolver routing rules: PASSED');
  }

  // 3. LicensingPipeline integration verification
  {
    const pipeline = LicensingPipeline.getInstance();

    // 3.1 Anonymous (COMMUNITY) trying to access STANDARD endpoint (/dashboard) throws Insufficient Edition (402)
    const context = new ApiExecutionContext();
    const authAnon = new AuthenticationContext({
      identityId: 'anonymous',
      identityType: IdentityType.ANONYMOUS,
      authenticationMethod: AuthenticationMethod.NONE,
      authenticated: false,
      issuedAt: Date.now()
    });
    context.setAuthenticationContext(authAnon);

    const reqDash = new ApiRequest({ method: 'GET', path: '/dashboard', version: 'v2', requestId: 'req-lic-3' });

    let planThrew = false;
    try {
      pipeline.execute(reqDash, context);
    } catch (e) {
      if (e instanceof LicenseException) {
        planThrew = true;
        assert(e.code === 'PM-LIC-003', 'Expected Insufficient Edition code PM-LIC-003');
      }
    }
    assert(planThrew === true, 'Low plan edition did not trigger validation error');

    // 3.2 Member (STANDARD) accessing STANDARD endpoint (/dashboard) succeeds
    const contextMember = new ApiExecutionContext();
    const authMember = new AuthenticationContext({
      identityId: 'user-liff-stub-123',
      identityType: IdentityType.USER,
      authenticationMethod: AuthenticationMethod.LIFF,
      authenticated: true,
      issuedAt: Date.now()
    });
    contextMember.setAuthenticationContext(authMember);

    let memberThrew = false;
    try {
      pipeline.execute(reqDash, contextMember);
    } catch (e) {
      memberThrew = true;
    }
    assert(memberThrew === false, 'STANDARD edition member was rejected from dashboard');

    // 3.3 Expired license throws LicenseException (PM-LIC-002)
    const originalResolve = LicenseResolver.prototype.resolve;
    LicenseResolver.prototype.resolve = function(authContext) {
      const ctx = originalResolve.call(this, authContext);
      return {
        ...ctx,
        status: LicenseStatus.EXPIRED
      };
    };

    let expiredThrew = false;
    try {
      pipeline.execute(reqDash, contextMember);
    } catch (e) {
      if (e instanceof LicenseException) {
        expiredThrew = true;
        assert(e.code === 'PM-LIC-002', 'Expected License Expired code PM-LIC-002');
      }
    }
    assert(expiredThrew === true, 'Expired license did not trigger expired validation check');

    // Restore original resolver
    LicenseResolver.prototype.resolve = originalResolve;

    // 3.4 Validation disabled bypasses checks
    const configInstance = GasConfigurationProvider.getInstance();
    const originalGetFeatureFlags = configInstance.getFeatureFlags;
    const originalFlags = originalGetFeatureFlags.call(configInstance);

    configInstance.getFeatureFlags = () => ({
      ...originalFlags,
      licensingEnabled: false
    });

    let bypassSuccess = false;
    try {
      pipeline.execute(reqDash, context); // Anonymous normally throws, but now bypasses
      bypassSuccess = true;
    } catch (e) {
      bypassSuccess = false;
    }
    assert(bypassSuccess === true, 'Disabled licensing pipeline still threw exception');

    // Restore feature flags
    configInstance.getFeatureFlags = originalGetFeatureFlags;

    console.log('[Test Lic] LicensingPipeline integration execution: PASSED');
  }

  console.log('[Test Lic] All Licensing Foundation tests completed.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  LICENSING & EDITION FOUNDATION PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[Licensing Test Failure]', err);
  if (typeof (globalThis as any).process !== 'undefined') {
    (globalThis as any).process.exit(1);
  }
});
