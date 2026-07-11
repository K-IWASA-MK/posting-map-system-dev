import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { OperationsDashboardApplicationService } from '@application/operations/services/OperationsDashboardApplicationService';
import { FieldApiMapper } from '../field/FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class OperationsDashboardHandler implements EndpointHandler {
  constructor(
    private operationsDashboardAppService: OperationsDashboardApplicationService
  ) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const path = request.path;

      if (path.includes('/operations/dashboard/workspaces')) {
        const overview = await this.operationsDashboardAppService.getWorkspaceSubscriptionOverview();
        const result = overview.map(o => ({
          workspaceId: o.workspaceId,
          workspaceName: o.workspaceName,
          status: o.status,
          startedAt: o.startedAt,
          expiresAt: o.expiresAt,
          remainingDays: o.remainingDays
        }));
        return FieldApiMapper.toSuccessResponse(result, request, context);
      }

      throw new Error(`Unknown operations path: ${path}`);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
