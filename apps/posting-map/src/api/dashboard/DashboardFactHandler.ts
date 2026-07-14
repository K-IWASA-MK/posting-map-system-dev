import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { FieldApiMapper } from '../field/FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';
import { RepositoryPerformanceProfiler } from '@infra/repository/profiler/RepositoryPerformanceProfiler';
import { DashboardFactService } from '../../application/dashboard/services/DashboardFactService';
import { DashboardFilterDto } from '../../application/dashboard/dto/DashboardFilterDto';

export class DashboardFactHandler implements EndpointHandler {
  constructor(private service: DashboardFactService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const path = request.path;

      if (request.method === 'GET') {
        if (path === '/dashboard/facts') {
          const filter: DashboardFilterDto = {
            date: request.query.date,
            district: request.query.district,
            area: request.query.area,
            minDistributionCount: request.query.minCount ? Number(request.query.minCount) : undefined,
            maxDistributionCount: request.query.maxCount ? Number(request.query.maxCount) : undefined,
            syncStatus: request.query.syncStatus,
            sortBy: request.query.sortBy,
            sortDirection: request.query.sortDirection as 'asc' | 'desc',
            page: request.query.page ? Number(request.query.page) : undefined,
            limit: request.query.limit ? Number(request.query.limit) : undefined
          };
          const result = await this.service.getDistributionFacts(filter);
          return FieldApiMapper.toSuccessResponse(result, request, context);
        }

        if (path.match(/^\/dashboard\/facts\/detail\/.+$/)) {
          const id = path.split('/').pop()!;
          if (!id) throw new Error('ID is required');
          const result = await this.service.getFactDetail(id);
          return FieldApiMapper.toSuccessResponse(result, request, context);
        }

        if (path === '/dashboard/holdings') {
          const result = await this.service.getFlyerHoldings();
          return FieldApiMapper.toSuccessResponse(result, request, context);
        }
      }

      if (request.method === 'POST') {
        let payload: any = request.body || {};

        if (path === '/dashboard/holdings/add') {
          await this.service.addFlyerHolding(payload.dto);
          return FieldApiMapper.toSuccessResponse({ success: true }, request, context);
        }

        if (path === '/dashboard/holdings/update') {
          await this.service.updateFlyerHolding(payload.dto);
          return FieldApiMapper.toSuccessResponse({ success: true }, request, context);
        }

        if (path === '/dashboard/holdings/delete') {
          await this.service.deleteFlyerHolding(payload.keeper);
          return FieldApiMapper.toSuccessResponse({ success: true }, request, context);
        }
      }

      throw new Error(`Unknown dashboard fact path or method: ${request.method} ${path}`);
    } catch (error: any) {
      console.error('[DashboardFactHandler] Error:', error);
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    } finally {
      RepositoryPerformanceProfiler.getInstance().reset();
    }
  }
}
