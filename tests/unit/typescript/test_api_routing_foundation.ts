import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiVersionResolver } from '@core/api/ApiVersionResolver';
import { RouteResolver } from '@core/api/RouteResolver';
import { EndpointRegistry } from '@core/api/EndpointRegistry';
import { ApiRouter } from '@core/api/ApiRouter';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// Mock globals for version resolver (Configuration dependency)
const globalVar = globalThis as any;
globalVar.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (key: string) => null
  })
};

async function runTests() {
  console.log('[Test APIRouting] Starting API Routing & Endpoint Foundation tests...');

  const context = new ApiExecutionContext();

  // 1. ApiRequest / ApiResponse Immutability
  {
    const req = new ApiRequest({
      method: 'GET',
      path: '/dashboard',
      version: 'v2',
      query: { branchId: 'MIE-03' },
      requestId: 'req-123'
    });
    assert(req.method === 'GET', 'Method mapping failure');
    assert(req.path === '/dashboard', 'Path mapping failure');
    assert(req.query.branchId === 'MIE-03', 'Query parameters mapping failure');
    assert(req.requestId === 'req-123', 'Request ID mapping failure');

    const res = ApiResponse.successResponse({ test: 'data' }, 200, {
      requestId: 'req-123',
      serverTimestamp: 1000,
      processingTime: 5,
      version: 'v2'
    });
    assert(res.status === 200, 'Status mismatch');
    assert(res.success === true, 'Success flag mismatch');
    assert(res.data.test === 'data', 'Data payload mismatch');
    assert(res.metadata.requestId === 'req-123', 'Metadata mapping mismatch');

    console.log('[Test APIRouting] Request/Response Models: PASSED');
  }

  // 2. ApiVersionResolver Test
  {
    // Path version resolution
    const v1 = ApiVersionResolver.resolve('v2', undefined);
    assert(v1 === 'v2', 'Path version should be resolved first');

    // Query version resolution
    const v2 = ApiVersionResolver.resolve(undefined, '3');
    assert(v2 === 'v3', 'Query version parameter normalized version mismatched');

    // Default configuration version fallback
    const v3 = ApiVersionResolver.resolve(undefined, undefined);
    assert(v3 === 'v1' || v3 === 'v2', 'Default version resolution failed');

    console.log('[Test APIRouting] ApiVersionResolver: PASSED');
  }

  // 3. RouteResolver & RouteKey formatting
  {
    const key1 = RouteResolver.resolveKey('GET', 'v2', 'dashboard');
    assert(key1 === 'GET:v2:/dashboard', 'Trailing slash normalization failure');

    const key2 = RouteResolver.resolveKey('post', 'V3', '/holding/');
    assert(key2 === 'POST:v3:/holding', 'Case normalization or trailing slash cleanup failure');

    console.log('[Test APIRouting] RouteResolver & RouteKey: PASSED');
  }

  // 4. EndpointRegistry & ApiRouter Dispatch
  {
    const router = ApiRouter.getInstance();

    // GET /v2/dashboard stub dispatch -> 501 NotImplemented
    const req1 = new ApiRequest({
      method: 'GET',
      path: '/dashboard',
      version: 'v2',
      requestId: context.getRequestId()
    });
    const res1 = router.route(req1, context);
    assert(res1.status === 501, 'Dashboard stub should return 501 NotImplemented');
    assert(res1.error?.code === 'NOT_IMPLEMENTED', 'Expected code NOT_IMPLEMENTED');

    // 404 Route Not Found
    const req2 = new ApiRequest({
      method: 'GET',
      path: '/unknown-route',
      version: 'v2',
      requestId: context.getRequestId()
    });
    const res2 = router.route(req2, context);
    assert(res2.status === 404, 'Unknown endpoint should return 404 Not Found');
    assert(res2.error?.code === 'ROUTE_NOT_FOUND', 'Expected error code ROUTE_NOT_FOUND');

    // 405 Method Not Allowed
    const req3 = new ApiRequest({
      method: 'PATCH',
      path: '/dashboard',
      version: 'v2',
      requestId: context.getRequestId()
    });
    const res3 = router.route(req3, context);
    assert(res3.status === 405, 'Disallowed HTTP method should return 405 Method Not Allowed');
    assert(res3.error?.code === 'METHOD_NOT_ALLOWED', 'Expected error code METHOD_NOT_ALLOWED');

    console.log('[Test APIRouting] EndpointRegistry & ApiRouter Dispatch: PASSED');
  }

  console.log('[Test APIRouting] All API Routing & Endpoint Foundation tests completed.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  API ROUTING FOUNDATION TESTS PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[APIRouting Test Failure]', err);
  if (typeof (globalThis as any).process !== 'undefined') {
    (globalThis as any).process.exit(1);
  }
});
