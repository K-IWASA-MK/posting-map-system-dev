import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { DashboardApplicationService } from '@application/dashboard/services/DashboardApplicationService';
import { FieldApiMapper } from '../field/FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class DashboardHandler implements EndpointHandler {
  constructor(
    private dashboardAppService: DashboardApplicationService
  ) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const path = request.path;

      if (path.includes('/dashboard/me')) {
        const lineUserId = request.query.lineUserId;
        if (!lineUserId || lineUserId.trim().length === 0) {
          throw new Error('lineUserId is required');
        }

        const yearMonthParam = request.query.yearMonth;

        const dashboard = await this.dashboardAppService.getPersonalDashboardByLineUserId(lineUserId, yearMonthParam);
        const result = {
          name: dashboard.displayName,
          holding: dashboard.holdingQuantity,
          monthlyActivity: dashboard.monthlyDistributionQuantity
        };
        return FieldApiMapper.toSuccessResponse(result, request, context);
      }

      if (path.includes('/dashboard/workspace/')) {
        const workspaceId = request.pathParams.id;
        if (!workspaceId || workspaceId.trim().length === 0) {
          throw new Error('workspaceId is required');
        }

        const yearMonthParam = request.query.yearMonth;

        const dashboard = await this.dashboardAppService.getWorkspaceDashboard(workspaceId, yearMonthParam);
        const result = {
          name: dashboard.workspaceName,
          total: dashboard.totalHoldingQuantity,
          monthlyActivity: dashboard.monthlyDistributionQuantity,
          members: dashboard.members,
          newMembers: dashboard.newMembers
        };
        return FieldApiMapper.toSuccessResponse(result, request, context);
      }

      if (path.includes('/dashboard/ranking')) {
        const workspaceId = request.query.workspaceId;
        if (!workspaceId || workspaceId.trim().length === 0) {
          throw new Error('workspaceId is required');
        }

        const yearMonthParam = request.query.yearMonth;

        const rankings = await this.dashboardAppService.getMonthlyRanking(workspaceId, yearMonthParam);
        const result = rankings.map(r => ({
          rank: r.rank,
          name: r.displayName,
          quantity: r.quantity
        }));
        return FieldApiMapper.toSuccessResponse(result, request, context);
      }

      throw new Error(`Unknown dashboard path: ${path}`);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
