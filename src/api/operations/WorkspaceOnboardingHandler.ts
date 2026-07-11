import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { WorkspaceOnboardingService } from '@application/onboarding/services/WorkspaceOnboardingService';
import { FieldApiMapper } from '../field/FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class WorkspaceOnboardingHandler implements EndpointHandler {
  constructor(
    private onboardingService: WorkspaceOnboardingService
  ) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const path = request.path;

      if (request.method === 'POST' && path.includes('/operations/workspaces')) {
        const { workspaceName, workspaceId } = request.body || {};
        if (!workspaceName) {
          throw new Error('workspaceName is required');
        }

        const dto = await this.onboardingService.createWorkspace(workspaceName, workspaceId);
        
        // Exact API response shape required by spec:
        // {
        //   "workspaceId": "mie-4",
        //   "lineAppUrl": "...",
        //   "dashboardUrl": "...",
        //   "status": "ACTIVE"
        // }
        const result = {
          workspaceId: dto.workspaceId,
          lineAppUrl: dto.lineAppUrl,
          dashboardUrl: dto.dashboardUrl,
          status: dto.status
        };

        return FieldApiMapper.toSuccessResponse(result, request, context);
      }

      if (request.method === 'GET' && path.includes('/operations/workspaces')) {
        const workspaceId = (request.query && request.query.workspaceId) || (request.body && request.body.workspaceId);
        if (!workspaceId) {
          throw new Error('workspaceId is required');
        }

        const dto = await this.onboardingService.getWorkspaceProvisioningStatus(workspaceId);
        return FieldApiMapper.toSuccessResponse(dto, request, context);
      }

      throw new Error(`Unsupported method or route: ${request.method} ${path}`);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
