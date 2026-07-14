import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { SubscriptionApplicationService } from '@application/subscription/SubscriptionApplicationService';
import { FieldApiMapper } from '../field/FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class SubscriptionHandler implements EndpointHandler {
  constructor(
    private subscriptionAppService: SubscriptionApplicationService
  ) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const path = request.path;

      if (path.includes('/operations/subscriptions/update')) {
        const { workspaceId, status, expiresAt } = request.body || {};
        if (!workspaceId) {
          throw new Error('workspaceId is required');
        }
        if (!status) {
          throw new Error('status is required');
        }
        if (!expiresAt) {
          throw new Error('expiresAt is required');
        }

        const expiresDate = new Date(expiresAt);
        if (isNaN(expiresDate.getTime())) {
          throw new Error('Invalid expiresAt date format');
        }

        await this.subscriptionAppService.updateSubscription(workspaceId, status as any, expiresDate);
        return FieldApiMapper.toSuccessResponse({ success: true }, request, context);
      }

      if (path.includes('/operations/subscriptions')) {
        const subs = await this.subscriptionAppService.getAllSubscriptions();
        return FieldApiMapper.toSuccessResponse(subs, request, context);
      }

      throw new Error(`Unknown operations path: ${path}`);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
