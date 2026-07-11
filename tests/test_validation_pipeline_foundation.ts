import { ApiRequest } from '../src/api/ApiRequest';
import { ValidationPipeline } from '../src/validation/ValidationPipeline';
import { ApiExecutionContext } from '../src/gas/ApiExecutionContext';
import { GasConfigurationProvider } from '../src/gas/GasConfigurationProvider';
import { ValidationException } from '../src/validation/ValidationException';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// Mock globals for Gas configuration dependencies
const globalVar = globalThis as any;
globalVar.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (key: string) => null
  })
};

async function runTests() {
  console.log('[Test ValidationPipeline] Starting Validation Pipeline tests...');

  const context = new ApiExecutionContext();
  const pipeline = ValidationPipeline.getInstance();

  // Mock GasConfigurationProvider feature flags
  const configInstance = GasConfigurationProvider.getInstance();
  configInstance.getFeatureFlags = () => ({
    flyerHolding: true,
    googleMaps: true,
    mapbox: true,
    gpsEvidence: true,
    photoEvidence: true,
    aiosBridge: false,
    analytics: false,
    apiKeyAuth: true,
    liffAuth: true,
    serviceAuth: true,
    anonymousAccess: true,
    authorizationEnabled: true,
    roleValidation: true,
    scopeValidation: true,
    permissionValidation: true
  });

  // 1. Normal Request Verification (Passes Validation)
  {
    const req = new ApiRequest({
      method: 'GET',
      path: '/dashboard',
      version: 'v2',
      requestId: 'req-normal'
    });
    
    const result = pipeline.validate(req, context);
    assert(result.valid === true, 'Normal request should be valid');
    console.log('[Test ValidationPipeline] Normal request validation: PASSED');
  }

  // 2. RequestValidator (Invalid Request)
  {
    const req = new ApiRequest({
      method: '',
      path: '',
      version: 'v2',
      requestId: ''
    });

    try {
      pipeline.validate(req, context);
      assert(false, 'Invalid request should throw ValidationException');
    } catch (err: any) {
      assert(err instanceof ValidationException, 'Expected ValidationException');
      assert(err.status === 400, 'Expected status 400 Bad Request');
      assert(err.result.errors[0].code === 'INVALID_REQUEST', 'Expected INVALID_REQUEST error');
      assert(err.result.errors[0].validatorId === 'REQUEST_VALIDATOR', 'Expected fail at REQUEST_VALIDATOR');
    }
    console.log('[Test ValidationPipeline] RequestValidator checks: PASSED');
  }

  // 3. MethodValidator (Invalid Method)
  {
    const req = new ApiRequest({
      method: 'PATCH',
      path: '/dashboard',
      version: 'v2',
      requestId: 'req-patch'
    });

    try {
      pipeline.validate(req, context);
      assert(false, 'Invalid HTTP method should fail');
    } catch (err: any) {
      assert(err instanceof ValidationException, 'Expected ValidationException');
      assert(err.status === 405, 'Expected 405 Method Not Allowed');
      assert(err.result.errors[0].code === 'INVALID_METHOD', 'Expected INVALID_METHOD error');
    }
    console.log('[Test ValidationPipeline] MethodValidator checks: PASSED');
  }

  // 4. VersionValidator (Invalid Version)
  {
    const req = new ApiRequest({
      method: 'GET',
      path: '/dashboard',
      version: 'v9',
      requestId: 'req-v9'
    });

    try {
      pipeline.validate(req, context);
      assert(false, 'Unsupported API version should fail');
    } catch (err: any) {
      assert(err instanceof ValidationException, 'Expected ValidationException');
      assert(err.status === 422, 'Expected 422 Validation Failed');
      assert(err.result.errors[0].code === 'INVALID_VERSION', 'Expected INVALID_VERSION error');
    }
    console.log('[Test ValidationPipeline] VersionValidator checks: PASSED');
  }

  // 5. RouteValidator (Route Not Found)
  {
    const req = new ApiRequest({
      method: 'GET',
      path: '/unknown-route-name',
      version: 'v2',
      requestId: 'req-unknown'
    });

    try {
      pipeline.validate(req, context);
      assert(false, 'Unregistered route should fail RouteValidator');
    } catch (err: any) {
      assert(err instanceof ValidationException, 'Expected ValidationException');
      assert(err.status === 404, 'Expected 404 Route Not Found');
      assert(err.result.errors[0].code === 'ROUTE_NOT_FOUND', 'Expected ROUTE_NOT_FOUND error');
    }
    console.log('[Test ValidationPipeline] RouteValidator checks: PASSED');
  }

  // 6. FeatureValidator (Feature Toggle Disabled)
  {
    // Toggle off flyerHolding
    configInstance.getFeatureFlags = () => ({
      flyerHolding: false,
      googleMaps: true,
      mapbox: true,
      gpsEvidence: true,
      photoEvidence: true,
      aiosBridge: false,
      analytics: false,
      apiKeyAuth: true,
      liffAuth: true,
      serviceAuth: true,
      anonymousAccess: true,
      authorizationEnabled: true,
      roleValidation: true,
      scopeValidation: true,
      permissionValidation: true
    });

    const req = new ApiRequest({
      method: 'GET',
      path: '/holding',
      version: 'v2',
      requestId: 'req-holding-disabled'
    });

    try {
      pipeline.validate(req, context);
      assert(false, 'Disabled feature request should fail FeatureValidator');
    } catch (err: any) {
      assert(err instanceof ValidationException, 'Expected ValidationException');
      assert(err.status === 422, 'Expected 422 Validation Failed');
      assert(err.result.errors[0].code === 'FEATURE_DISABLED', 'Expected FEATURE_DISABLED error');
    }
    console.log('[Test ValidationPipeline] FeatureValidator checks: PASSED');
  }

  console.log('[Test ValidationPipeline] All Validation Pipeline tests completed.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  VALIDATION PIPELINE TESTS PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[ValidationPipeline Test Failure]', err);
  if (typeof (globalThis as any).process !== 'undefined') {
    (globalThis as any).process.exit(1);
  }
});
