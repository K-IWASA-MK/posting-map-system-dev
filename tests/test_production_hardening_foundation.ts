import { ApiRequest } from '../src/api/ApiRequest';
import { ApiExecutionContext } from '../src/gas/ApiExecutionContext';
import { HealthCheckService } from '../src/hardening/HealthCheckService';
import { RequestGuard } from '../src/hardening/RequestGuard';
import { CircuitBreakerFoundation } from '../src/hardening/CircuitBreakerFoundation';
import { ReadinessValidator } from '../src/hardening/ReadinessValidator';
import { HardeningPipeline, HardeningException } from '../src/hardening/HardeningPipeline';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test Hardening] Starting Production Hardening tests...');

  const context = new ApiExecutionContext();

  // 1. HealthCheckService test
  {
    const service = HealthCheckService.getInstance();
    const health = service.checkHealth();
    assert(health.status === 'HEALTHY', 'Initial health state should be HEALTHY');
    assert(health.checks.CONFIG.status === 'OK', 'CONFIG check failed');
    assert(health.checks.REPOSITORY.status === 'OK', 'REPOSITORY check failed');
    console.log('[Test Hardening] HealthCheckService: PASSED');
  }

  // 2. RequestGuard checks
  {
    // Normal request
    const normalReq = new ApiRequest({
      method: 'POST',
      path: '/dashboard',
      version: 'v2',
      query: { action: 'getAppData' },
      body: { tenantId: 'MIE-03' },
      requestId: 'req-hard-1'
    });
    const normalResult = RequestGuard.check(normalReq);
    assert(normalResult.allowed === true, 'Normal request should be allowed');

    // Query parameters limit check
    const excessParams: Record<string, string> = {};
    for (let i = 0; i < 120; i++) {
      excessParams[`param${i}`] = 'value';
    }
    const badParamsReq = new ApiRequest({
      method: 'GET',
      path: '/dashboard',
      version: 'v2',
      query: excessParams,
      requestId: 'req-hard-2'
    });
    const badParamsResult = RequestGuard.check(badParamsReq);
    assert(badParamsResult.allowed === false, 'Excess query params count should be rejected');
    assert(badParamsResult.status === 400, 'Bad parameters should return 400 Bad Request');

    // Body size limit check
    const largeBody = 'x'.repeat(11 * 1024 * 1024); // 11MB (exceeds 10MB limit)
    const largeBodyReq = new ApiRequest({
      method: 'POST',
      path: '/dashboard',
      version: 'v2',
      body: { data: largeBody },
      requestId: 'req-hard-3'
    });
    const largeBodyResult = RequestGuard.check(largeBodyReq);
    assert(largeBodyResult.allowed === false, 'Oversized body payload should be rejected');
    assert(largeBodyResult.status === 413, 'Oversized body should return 413 Payload Too Large');

    console.log('[Test Hardening] RequestGuard checks: PASSED');
  }

  // 3. CircuitBreakerFoundation tests
  {
    const circuitBreaker = CircuitBreakerFoundation.getInstance();
    circuitBreaker.transitionTo('CLOSED');

    const closedCheck = circuitBreaker.check();
    assert(closedCheck.allowed === true, 'Closed circuit should allow requests');

    // Transition to OPEN
    circuitBreaker.transitionTo('OPEN', 'TIMEOUT');
    assert(circuitBreaker.getState() === 'OPEN', 'State transition failed');
    assert(circuitBreaker.getReason() === 'TIMEOUT', 'State reason mismatch');

    const openCheck = circuitBreaker.check();
    assert(openCheck.allowed === false, 'Open circuit should block requests');
    assert(openCheck.status === 503, 'Open circuit block should return 503');

    // Transition back to HALF_OPEN
    circuitBreaker.transitionTo('HALF_OPEN');
    assert(circuitBreaker.getState() === 'HALF_OPEN', 'Half open transition failed');
    assert(circuitBreaker.check().allowed === true, 'Half open circuit should allow test requests');

    // Reset to CLOSED
    circuitBreaker.transitionTo('CLOSED');
    console.log('[Test Hardening] CircuitBreakerFoundation state transitions: PASSED');
  }

  // 4. ReadinessValidator
  {
    const readiness = ReadinessValidator.validate();
    assert(readiness.allowed === true, 'System should be boot ready');
    console.log('[Test Hardening] ReadinessValidator: PASSED');
  }

  // 5. HardeningPipeline integration execution
  {
    const pipeline = HardeningPipeline.getInstance();
    
    // Normal request passes pipeline
    const normalReq = new ApiRequest({
      method: 'POST',
      path: '/dashboard',
      version: 'v2',
      requestId: 'req-hard-pipe-1'
    });
    
    let normalPassed = false;
    try {
      pipeline.execute(normalReq, context);
      normalPassed = true;
    } catch (e) {
      normalPassed = false;
    }
    assert(normalPassed === true, 'Pipeline rejected normal valid request');

    // Blocked requests throw HardeningException
    CircuitBreakerFoundation.getInstance().transitionTo('OPEN', 'RESOURCE');
    let rejectedByCircuit = false;
    try {
      pipeline.execute(normalReq, context);
    } catch (e) {
      if (e instanceof HardeningException) {
        rejectedByCircuit = true;
        assert(e.status === 503, 'Expected 503 from open circuit');
        assert(e.code === 'PM-HRD-CBT', 'Expected circuit block error code');
      }
    }
    assert(rejectedByCircuit === true, 'Pipeline did not throw on open circuit breaker');

    // Reset circuit breaker state
    CircuitBreakerFoundation.getInstance().transitionTo('CLOSED');
    console.log('[Test Hardening] HardeningPipeline integrated execution: PASSED');
  }

  console.log('[Test Hardening] All Production Hardening tests completed.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  PRODUCTION HARDENING TESTS PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[ProductionHardening Test Failure]', err);
  if (typeof (globalThis as any).process !== 'undefined') {
    (globalThis as any).process.exit(1);
  }
});
