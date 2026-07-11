import { EndpointHandler } from './EndpointHandler';
import { ApiRequest } from '../ApiRequest';
import { ApiResponse } from '../ApiResponse';
import { ApiExecutionContext } from '../../gas/ApiExecutionContext';
import { RoutePolicy } from '../RoutePolicy';

export class UnknownEndpointHandler implements EndpointHandler {
  public execute(request: ApiRequest, context: ApiExecutionContext): ApiResponse {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };

    if (!RoutePolicy.isMethodAllowed(request.method)) {
      return ApiResponse.errorResponse(
        'METHOD_NOT_ALLOWED',
        `HTTP Method ${request.method} is not allowed.`,
        405,
        metadata
      );
    }

    return ApiResponse.errorResponse(
      'ROUTE_NOT_FOUND',
      `API Route "${request.method} ${request.path}" under version ${request.version} was not found.`,
      404,
      metadata
    );
  }
}
