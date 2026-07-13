import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { SystemException } from '@core/exceptions/SystemException';
import { RoutingException } from '@core/exceptions/RoutingException';
import { ConfigurationException } from '@core/exceptions/ConfigurationException';
import { FeatureException } from '@core/exceptions/FeatureException';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';
import { ExceptionHandler } from '@core/exceptions/ExceptionHandler';
import { ValidationResult } from '@foundation/validation/ValidationResult';
import { ValidationError } from '@foundation/validation/ValidationError';
import { ValidationException } from '@foundation/validation/ValidationException';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test ExceptionFramework] Starting Exception Framework tests...');

  const context = new ApiExecutionContext();
  const request = new ApiRequest({
    method: 'GET',
    path: '/dashboard',
    version: 'v2',
    requestId: 'req-err-123'
  });

  // 1. Base ApiException properties & SystemException
  {
    const sysExc = new SystemException('Null Reference Occurred', 'req-err-123', 'Stack trace data...');
    assert(sysExc.code === 'PM-SYS-001', 'Unexpected exception code');
    assert(sysExc.status === 500, 'Unexpected HTTP status');
    assert(sysExc.internalMessage === 'Null Reference Occurred', 'Unexpected internal message');
    assert(sysExc.externalMessage === '予期しないシステムエラーが発生しました。', 'Unexpected external message');
    assert(sysExc.metadata.details === 'Stack trace data...', 'Unexpected metadata details');
    console.log('[Test ExceptionFramework] SystemException: PASSED');
  }

  // 2. RoutingException notFound and methodNotAllowed
  {
    const notFoundExc = RoutingException.notFound('Route GET /dummy not found', 'req-err-123');
    assert(notFoundExc.code === 'PM-RTE-001', 'NotFound exception code mismatch');
    assert(notFoundExc.status === 404, 'NotFound HTTP status mismatch');
    assert(notFoundExc.externalMessage === '指定された API ルートが見つかりません。', 'External message mismatch');

    const methodNotAllowedExc = RoutingException.methodNotAllowed('PATCH /dashboard not allowed', 'req-err-123');
    assert(methodNotAllowedExc.code === 'PM-RTE-002', 'MethodNotAllowed exception code mismatch');
    assert(methodNotAllowedExc.status === 405, 'MethodNotAllowed HTTP status mismatch');
    assert(methodNotAllowedExc.externalMessage === '指定された HTTP メソッドは許可されていません。', 'External message mismatch');
    console.log('[Test ExceptionFramework] RoutingException: PASSED');
  }

  // 3. ConfigurationException & FeatureException
  {
    const configExc = new ConfigurationException('Database configuration missing', 'req-err-123');
    assert(configExc.code === 'PM-CFG-001', 'Config exception code mismatch');
    assert(configExc.status === 500, 'Config HTTP status mismatch');

    const featureExc = new FeatureException('Mapbox toggle is disabled', 'req-err-123');
    assert(featureExc.code === 'PM-FTR-001', 'Feature exception code mismatch');
    assert(featureExc.status === 422, 'Feature HTTP status mismatch');
    console.log('[Test ExceptionFramework] Config & Feature exceptions: PASSED');
  }

  // 4. ValidationException integration
  {
    const valResult = ValidationResult.failure(
      [{ code: ValidationError.INVALID_METHOD, message: 'Invalid HTTP method', validatorId: 'METHOD_VALIDATOR' }],
      1000,
      2
    );
    const valExc = new ValidationException(valResult);
    assert(valExc.code === 'PM-VAL-001', 'ValidationException code mismatch');
    assert(valExc.status === 405, 'ValidationException HTTP status mismatch'); // mapped from INVALID_METHOD status 405
    assert(valExc.internalMessage.includes('METHOD_VALIDATOR'), 'Internal message does not reference Validator ID');
    console.log('[Test ExceptionFramework] ValidationException Integration: PASSED');
  }

  // 5. ExceptionMapper test (Internal/External message separation)
  {
    const rawError = new Error('Database connection timed out');
    const mappedRes = ExceptionMapper.toResponse(rawError, request, context);

    assert(mappedRes.status === 500, 'Standard Error should map to 500');
    assert(mappedRes.success === false, 'Standard Error response should be false success');
    assert(mappedRes.error?.code === 'PM-SYS-001', 'Standard Error should wrap into SystemException code');
    assert(mappedRes.error?.message === '予期しないシステムエラーが発生しました。', 'External error message leaked sensitive data');
    assert((mappedRes.metadata as any).exception.internalMessage === 'Database connection timed out', 'Internal message was lost');
    console.log('[Test ExceptionFramework] ExceptionMapper internal/external separation: PASSED');
  }

  // 6. ExceptionHandler Hook Listener Test (S3-5 Hook)
  {
    let hookTriggered: boolean = false;
    let receivedError: Error | null = null;

    ExceptionHandler.clearListeners();
    ExceptionHandler.addListener((err, req, ctx) => {
      hookTriggered = true;
      receivedError = err;
    });

    const errorToTest = new ConfigurationException('Missing API Key', 'req-err-123');
    const response = ExceptionHandler.handle(errorToTest, request, context);

    assert(hookTriggered as any === true, 'Exception Event Hook listener did not fire');
    assert(receivedError === errorToTest, 'Received error inside hook mismatch');
    assert(response.status === 500, 'Handled response status mismatch');
    console.log('[Test ExceptionFramework] ExceptionHandler Hook Listeners: PASSED');
  }

  console.log('[Test ExceptionFramework] All Exception Framework tests completed.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  EXCEPTION FRAMEWORK TESTS PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[ExceptionFramework Test Failure]', err);
  if (typeof (globalThis as any).process !== 'undefined') {
    (globalThis as any).process.exit(1);
  }
});
