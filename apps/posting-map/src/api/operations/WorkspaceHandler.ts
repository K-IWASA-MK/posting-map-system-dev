import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { WorkspaceApplicationService } from '@application/workspace/services/WorkspaceApplicationService';
import { FieldApiMapper } from '../field/FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class WorkspaceHandler implements EndpointHandler {
  constructor(
    private workspaceService: WorkspaceApplicationService
  ) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const path = request.path;

      if (request.method === 'POST' && path.includes('/operations/workspaces')) {
        const body = request.body || {};
        const { workspaceId, distributionGoal, updatedBy, workspaceName } = body;

        // If goal settings parameters are present, process as Update Goal
        if (distributionGoal !== undefined && workspaceId) {
          const author = updatedBy || (request.query && request.query.googleEmail) || 'システム管理者';
          const dto = await this.workspaceService.updateWorkspaceGoal(workspaceId, Number(distributionGoal), String(author));
          return FieldApiMapper.toSuccessResponse(dto, request, context);
        }

        // Otherwise process as Create Workspace (Onboarding)
        if (!workspaceName) {
          throw new Error('workspaceName is required');
        }

        const dto = await this.workspaceService.createWorkspace(workspaceName, workspaceId);
        
        // Match compatibility shape
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

        const dto = await this.workspaceService.getWorkspace(workspaceId);
        return FieldApiMapper.toSuccessResponse(dto, request, context);
      }

      throw new Error(`Unsupported method or route: ${request.method} ${path}`);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
