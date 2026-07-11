import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { IdentityResolver } from '@foundation/authentication/IdentityResolver';
import { ApiKeyIdentityProvider } from '@foundation/authentication/providers/ApiKeyIdentityProvider';
import { LIFFIdentityProvider } from '@foundation/authentication/providers/LIFFIdentityProvider';
import { ServiceIdentityProvider } from '@foundation/authentication/providers/ServiceIdentityProvider';
import { AuthenticationPipeline } from '@foundation/authentication/AuthenticationPipeline';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from '@foundation/authentication/AuthenticationContext';
import { AuthenticationException } from '@core/exceptions/AuthenticationException';
import { GasConfigurationProvider } from '@infra/gas/GasConfigurationProvider';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test Auth] Starting Authentication Foundation tests...');

  // 1. Providers Stub Test
  {
    const apiKeyProvider = new ApiKeyIdentityProvider();
    const liffProvider = new LIFFIdentityProvider();
    const serviceProvider = new ServiceIdentityProvider();

    // ApiKey validation stub
    const reqKeyOk = new ApiRequest({ method: 'GET', path: '/test', version: 'v2', query: { apiKey: 'valid-api-key' }, requestId: 'req-auth-1' });
    const resKeyOk = apiKeyProvider.authenticate(reqKeyOk);
    assert(resKeyOk.success === true, 'Valid API key authentication should succeed');
    assert(resKeyOk.context?.identityId === 'user-api-key-stub', 'API key stub context mismatch');

    const reqKeyNg = new ApiRequest({ method: 'GET', path: '/test', version: 'v2', query: { apiKey: 'invalid-key' }, requestId: 'req-auth-2' });
    const resKeyNg = apiKeyProvider.authenticate(reqKeyNg);
    assert(resKeyNg.success === false, 'Invalid API key should fail authentication');

    // LIFF validation stub
    const reqLiffOk = new ApiRequest({ method: 'POST', path: '/test', version: 'v2', query: { liffToken: 'Bearer valid-liff-token' }, requestId: 'req-auth-3' });
    const resLiffOk = liffProvider.authenticate(reqLiffOk);
    assert(resLiffOk.success === true, 'Valid LIFF token should succeed');
    assert(resLiffOk.context?.identityId === 'user-liff-stub-123', 'LIFF context mismatch');

    // Service validation stub
    const reqServiceOk = new ApiRequest({ method: 'POST', path: '/test', version: 'v2', headers: { 'x-service-auth': 'valid-service-key' }, requestId: 'req-auth-4' });
    const resServiceOk = serviceProvider.authenticate(reqServiceOk);
    assert(resServiceOk.success === true, 'Valid Service key should succeed');

    console.log('[Test Auth] Provider Stubs: PASSED');
  }

  // 2. IdentityResolver Priority Rules Test
  {
    // Multiple auth attributes present: Service vs API Key vs LIFF
    const reqAll = new ApiRequest({
      method: 'POST',
      path: '/test',
      version: 'v2',
      query: { apiKey: 'valid-api-key', liffToken: 'valid-liff-token' },
      headers: { 'x-service-auth': 'valid-service-key' },
      requestId: 'req-auth-5'
    });

    const provider = IdentityResolver.resolve(reqAll);
    assert(provider instanceof ServiceIdentityProvider, 'Highest priority (Service Auth) resolver failed');

    const reqKeyAndLiff = new ApiRequest({
      method: 'POST',
      path: '/test',
      version: 'v2',
      query: { apiKey: 'valid-api-key', liffToken: 'valid-liff-token' },
      requestId: 'req-auth-6'
    });
    const provider2 = IdentityResolver.resolve(reqKeyAndLiff);
    assert(provider2 instanceof ApiKeyIdentityProvider, 'Medium priority (API Key) resolver failed');

    const reqLiffOnly = new ApiRequest({
      method: 'POST',
      path: '/test',
      version: 'v2',
      query: { liffToken: 'valid-liff-token' },
      requestId: 'req-auth-7'
    });
    const provider3 = IdentityResolver.resolve(reqLiffOnly);
    assert(provider3 instanceof LIFFIdentityProvider, 'Lowest priority (LIFF) resolver failed');

    const reqAnon = new ApiRequest({ method: 'GET', path: '/test', version: 'v2', requestId: 'req-auth-8' });
    const provider4 = IdentityResolver.resolve(reqAnon);
    assert(provider4 === null, 'No credentials resolver should return null');

    console.log('[Test Auth] IdentityResolver priority rules: PASSED');
  }

  // 3. AuthenticationPipeline integration execution
  {
    const pipeline = AuthenticationPipeline.getInstance();

    // Case A: Valid API Key succeeds
    const executionContext = new ApiExecutionContext();
    const reqOk = new ApiRequest({
      method: 'GET',
      path: '/dashboard',
      version: 'v2',
      query: { apiKey: 'valid-api-key' },
      requestId: 'req-auth-9'
    });
    pipeline.execute(reqOk, executionContext);
    const authContext = executionContext.getAuthenticationContext();
    assert(authContext !== null, 'Context should be set on successful authentication');
    assert(authContext?.identityId === 'user-api-key-stub', 'IdentityId mismatch');
    assert(authContext?.authenticated === true, 'Authenticated should be true');

    // Case B: Invalid API Key throws AuthenticationException
    const reqBad = new ApiRequest({
      method: 'GET',
      path: '/dashboard',
      version: 'v2',
      query: { apiKey: 'invalid-key' },
      requestId: 'req-auth-10'
    });
    let badThrew = false;
    try {
      pipeline.execute(reqBad, executionContext);
    } catch (e) {
      if (e instanceof AuthenticationException) {
        badThrew = true;
        assert(e.code === 'PM-AUT-002', 'Expected API key failure code PM-AUT-002');
      }
    }
    assert(badThrew === true, 'Invalid credentials did not throw exception');

    // Case C: Missing credentials throws UNAUTHENTICATED
    const reqMissing = new ApiRequest({
      method: 'GET',
      path: '/dashboard',
      version: 'v2',
      requestId: 'req-auth-11'
    });
    let missingThrew = false;
    try {
      pipeline.execute(reqMissing, executionContext);
    } catch (e) {
      if (e instanceof AuthenticationException) {
        missingThrew = true;
        assert(e.code === 'PM-AUT-001', 'Expected unauthenticated failure code PM-AUT-001');
      }
    }
    assert(missingThrew === true, 'Missing credentials did not throw unauthenticated error');

    // Case D: Anonymous allowed route (e.g. /health) does NOT throw, assigns ANONYMOUS
    const reqHealth = new ApiRequest({
      method: 'GET',
      path: '/health',
      version: 'v2',
      requestId: 'req-auth-12'
    });
    const healthContext = new ApiExecutionContext();
    pipeline.execute(reqHealth, healthContext);
    const anonContext = healthContext.getAuthenticationContext();
    assert(anonContext !== null, 'Anonymous context should be set');
    assert(anonContext?.identityId === 'anonymous', 'Anonymous identityId mismatch');
    assert(anonContext?.authenticated === false, 'Anonymous authenticated should be false');
    assert(anonContext?.identityType === IdentityType.ANONYMOUS, 'Anonymous type mismatch');

    console.log('[Test Auth] AuthenticationPipeline integration execution: PASSED');
  }

  console.log('[Test Auth] All Authentication Foundation tests completed.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  AUTHENTICATION FOUNDATION PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[Authentication Test Failure]', err);
  if (typeof (globalThis as any).process !== 'undefined') {
    (globalThis as any).process.exit(1);
  }
});
