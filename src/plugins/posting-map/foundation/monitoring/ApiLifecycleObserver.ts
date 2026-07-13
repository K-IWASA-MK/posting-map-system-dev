import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { MonitoringPipeline } from './MonitoringPipeline';
import { AuditEvent } from './AuditEvent';

export class ApiLifecycleObserver {
  private static readonly pipeline = MonitoringPipeline.getInstance();

  public static onStart(request: ApiRequest, context: ApiExecutionContext): void {
    ApiLifecycleObserver.pipeline.resetSequence();
    ApiLifecycleObserver.pipeline.createAndDispatch(
      AuditEvent.REQUEST_STARTED,
      'LIFECYCLE',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      { method: request.method, path: request.path }
    );
  }

  public static onValidationSuccess(request: ApiRequest, context: ApiExecutionContext): void {
    ApiLifecycleObserver.pipeline.createAndDispatch(
      AuditEvent.VALIDATION_COMPLETED,
      'AUDIT',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      { path: request.path }
    );
  }

  public static onRoutingSuccess(request: ApiRequest, context: ApiExecutionContext): void {
    ApiLifecycleObserver.pipeline.createAndDispatch(
      AuditEvent.ROUTING_COMPLETED,
      'AUDIT',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      { path: request.path }
    );
  }

  public static onHandlerSuccess(request: ApiRequest, context: ApiExecutionContext): void {
    ApiLifecycleObserver.pipeline.createAndDispatch(
      AuditEvent.HANDLER_COMPLETED,
      'AUDIT',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      { path: request.path }
    );
  }

  public static onComplete(
    request: ApiRequest,
    response: ApiResponse,
    context: ApiExecutionContext
  ): void {
    // 1. Audit Event Dispatch
    ApiLifecycleObserver.pipeline.createAndDispatch(
      AuditEvent.REQUEST_COMPLETED,
      'LIFECYCLE',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      { path: request.path, status: response.status }
    );

    // 2. Metrics Event Dispatch
    // Calculate stage durations based on Performance metrics
    const validationTime = context.getValidationTime();
    const routingTime = context.getRoutingTime();
    const handlerTime = context.getHandlerTime();

    ApiLifecycleObserver.pipeline.createAndDispatch(
      'METRICS_COLLECTED',
      'METRICS',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      {
        processingTime: context.getElapsedTime(),
        validationTime,
        routingTime,
        handlerTime,
        statusCode: response.status,
        cacheStatus: 'NONE'
      }
    );
  }

  public static onException(
    error: Error,
    request: ApiRequest,
    context: ApiExecutionContext
  ): void {
    // Audit Event fail state
    ApiLifecycleObserver.pipeline.createAndDispatch(
      AuditEvent.REQUEST_FAILED,
      'LIFECYCLE',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      {
        path: request.path,
        exceptionMessage: error.message || String(error)
      }
    );
  }
}
