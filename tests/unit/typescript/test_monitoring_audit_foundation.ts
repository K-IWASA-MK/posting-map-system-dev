import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { MonitoringEvent } from '@foundation/monitoring/MonitoringEvent';
import { EventDispatcher } from '@foundation/monitoring/EventDispatcher';
import { AuditCollector } from '@foundation/monitoring/AuditCollector';
import { MetricsCollector } from '@foundation/monitoring/MetricsCollector';
import { ApiLifecycleObserver } from '@foundation/monitoring/ApiLifecycleObserver';
import { ExceptionHandler } from '@core/exceptions/ExceptionHandler';
import { SystemException } from '@core/exceptions/SystemException';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test MonitoringAudit] Starting Monitoring & Audit tests...');

  const context = new ApiExecutionContext();
  const request = new ApiRequest({
    method: 'GET',
    path: '/dashboard',
    version: 'v2',
    requestId: 'req-observ-123'
  });

  const auditCollector = AuditCollector.getInstance();
  const metricsCollector = MetricsCollector.getInstance();
  
  auditCollector.clear();
  metricsCollector.clear();

  // 1. Normal Request Lifecycle Verification
  {
    ApiLifecycleObserver.onStart(request, context);
    ApiLifecycleObserver.onValidationSuccess(request, context);
    ApiLifecycleObserver.onRoutingSuccess(request, context);
    ApiLifecycleObserver.onHandlerSuccess(request, context);

    const response = ApiResponse.successResponse({ status: 'ok' }, 200, {
      requestId: request.requestId,
      serverTimestamp: Date.now(),
      processingTime: 10,
      version: 'v2'
    });
    ApiLifecycleObserver.onComplete(request, response, context);

    // Assert correct sequences of Audit Events
    const audits = auditCollector.getEvents();
    assert(audits.length === 5, 'Expected 5 Audit/Lifecycle events in normal run');
    assert(audits[0].eventType === 'REQUEST_STARTED', 'Step 1 should be REQUEST_STARTED');
    assert(audits[0].sequenceNumber === 1, 'Sequence number should begin at 1');
    assert(audits[1].eventType === 'VALIDATION_COMPLETED', 'Step 2 should be VALIDATION_COMPLETED');
    assert(audits[1].sequenceNumber === 2, 'Sequence number should increment sequentially');
    assert(audits[4].eventType === 'REQUEST_COMPLETED', 'Final step should be REQUEST_COMPLETED');

    // Assert Metric Event
    const metrics = metricsCollector.getEvents();
    assert(metrics.length === 1, 'Expected 1 Metrics event');
    assert(metrics[0].payload.statusCode === 200, 'StatusCode mismatch in Metrics payload');
    assert(metrics[0].category === 'METRICS', 'Category mismatch for Metrics collector');

    console.log('[Test MonitoringAudit] Normal lifecycle observability: PASSED');
  }

  // 2. Exception and ExceptionHandler Integration
  {
    auditCollector.clear();
    
    // Register lifecycle exception observer inside exception handler
    ExceptionHandler.clearListeners();
    ExceptionHandler.addListener((err, req, ctx) => {
      ApiLifecycleObserver.onException(err, req, ctx);
    });

    const error = new SystemException('Spreadsheet physics break', 'req-observ-123');
    ExceptionHandler.handle(error, request, context);

    const audits = auditCollector.getEvents();
    assert(audits.length === 1, 'Expected 1 failure audit event');
    assert(audits[0].eventType === 'REQUEST_FAILED', 'Expected REQUEST_FAILED type');
    assert(audits[0].payload.exceptionMessage === 'Spreadsheet physics break', 'Exception message mismatch in payload');

    console.log('[Test MonitoringAudit] ExceptionHandler hook integration: PASSED');
  }

  // 3. Custom Listener Registration (EventDispatcher)
  {
    let customEventReceived: MonitoringEvent | null = null;
    const customListener = {
      onEvent: (event: MonitoringEvent) => {
        customEventReceived = event;
      }
    };

    EventDispatcher.getInstance().addListener(customListener);
    
    ApiLifecycleObserver.onStart(request, context);
    
    assert(customEventReceived !== null, 'Custom listener did not receive dispatched event');
    assert((customEventReceived as any).eventType === 'REQUEST_STARTED', 'Event type mismatch in custom observer');

    console.log('[Test MonitoringAudit] Custom Listener Dispatcher: PASSED');
  }

  console.log('[Test MonitoringAudit] All Monitoring & Audit tests completed.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  MONITORING & AUDIT TESTS PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[MonitoringAudit Test Failure]', err);
  if (typeof (globalThis as any).process !== 'undefined') {
    (globalThis as any).process.exit(1);
  }
});
