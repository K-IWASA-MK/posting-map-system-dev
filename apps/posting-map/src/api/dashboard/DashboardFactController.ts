import { DashboardFactService } from '../../application/dashboard/services/DashboardFactService';
import { DashboardFilterDto } from '../../application/dashboard/dto/DashboardFilterDto';
import { FlyerHoldingDto } from '../../application/dashboard/dto/FlyerHoldingDto';

export class DashboardFactController {
  constructor(private service: DashboardFactService) {}

  public async handle(request: any): Promise<any> {
    const action = request.parameter?.action;
    
    try {
      if (request.method === 'GET') {
        if (action === 'dashboard/facts') {
          const filter: DashboardFilterDto = {
            date: request.parameter.date,
            district: request.parameter.district,
            area: request.parameter.area,
            minDistributionCount: request.parameter.minCount ? Number(request.parameter.minCount) : undefined,
            maxDistributionCount: request.parameter.maxCount ? Number(request.parameter.maxCount) : undefined,
            syncStatus: request.parameter.syncStatus,
            sortBy: request.parameter.sortBy,
            sortDirection: request.parameter.sortDirection as 'asc' | 'desc',
            page: request.parameter.page ? Number(request.parameter.page) : undefined,
            limit: request.parameter.limit ? Number(request.parameter.limit) : undefined
          };
          const result = await this.service.getDistributionFacts(filter);
          return { success: true, data: result };
        }

        if (action === 'dashboard/facts/detail') {
          const id = request.parameter.id;
          if (!id) return { success: false, error: 'ID is required' };
          const result = await this.service.getFactDetail(id);
          return { success: true, data: result };
        }

        if (action === 'dashboard/holdings') {
          const result = await this.service.getFlyerHoldings();
          return { success: true, data: result };
        }
      }

      if (request.method === 'POST') {
        let payload: any;
        try {
          payload = JSON.parse(request.postData?.contents || '{}');
        } catch (e) {
          return { success: false, error: 'Invalid JSON body' };
        }

        const postAction = payload.action || action;

        if (postAction === 'dashboard/holdings/add') {
          await this.service.addFlyerHolding(payload.dto);
          return { success: true };
        }

        if (postAction === 'dashboard/holdings/update') {
          await this.service.updateFlyerHolding(payload.dto);
          return { success: true };
        }

        if (postAction === 'dashboard/holdings/delete') {
          await this.service.deleteFlyerHolding(payload.keeper);
          return { success: true };
        }
      }

      return { success: false, error: 'Invalid action or method for DashboardFactController' };
    } catch (e: any) {
      console.error('[DashboardFactController] Error:', e);
      return { success: false, error: e.message };
    }
  }
}
