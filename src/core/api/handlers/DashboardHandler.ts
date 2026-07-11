import { EndpointHandler } from './EndpointHandler';
import { ApiRequest } from '../ApiRequest';
import { ApiResponse } from '../ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';

export class DashboardHandler implements EndpointHandler {
  public execute(request: ApiRequest, context: ApiExecutionContext): ApiResponse {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    return ApiResponse.errorResponse(
      'NOT_IMPLEMENTED',
      'DashboardHandler is currently a placeholder stub in S3-2 Routing Foundation.',
      501,
      metadata
    );
  }
}
