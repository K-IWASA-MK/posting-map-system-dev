import { ApiRequest } from './ApiRequest';
import { ApiResponse } from './ApiResponse';
import { EndpointRegistry } from './EndpointRegistry';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { RoutePolicy } from './RoutePolicy';

export class ApiRouter {
  private static instance: ApiRouter | null = null;
  private registry: EndpointRegistry;

  private constructor() {
    this.registry = EndpointRegistry.getInstance();
  }

  public static getInstance(): ApiRouter {
    if (!ApiRouter.instance) {
      ApiRouter.instance = new ApiRouter();
    }
    return ApiRouter.instance;
  }

  public route(request: ApiRequest, context: ApiExecutionContext): ApiResponse {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };

    // 1. HTTP Method validation
    if (!RoutePolicy.isMethodAllowed(request.method)) {
      return ApiResponse.errorResponse(
        'METHOD_NOT_ALLOWED',
        `HTTP Method ${request.method} is not allowed by RoutePolicy.`,
        405,
        metadata
      );
    }

    try {
      // 2. Resolve handler
      const handler = this.registry.getHandler(request.method, request.version, request.path);
      
      // 3. Execute handler
      return handler.execute(request, context);
    } catch (err: any) {
      return ApiResponse.errorResponse(
        'INTERNAL_SERVER_ERROR',
        err.message || String(err),
        500,
        metadata
      );
    }
  }
}
