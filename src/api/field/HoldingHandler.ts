import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { HoldingApplicationService } from '@application/field/services/HoldingApplicationService';
import { DeclareHoldingCommand } from '@application/field/commands/DeclareHoldingCommand';
import { FieldApiMapper } from './FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class HoldingHandler implements EndpointHandler {
  constructor(private holdingAppService: HoldingApplicationService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      if (request.method === 'POST') {
        const body = request.body || {};
        const staffNo = body.staffId || '';
        const quantity = Number(body.count || 0);

        const command = new DeclareHoldingCommand(staffNo, quantity);
        const dto = await this.holdingAppService.declareHolding(command);

        return FieldApiMapper.toSuccessResponse({
          staffNo: dto.staffNo,
          quantity: dto.quantity,
          updatedAt: dto.updatedAt
        }, request, context);
      }

      // GET: Retrieve all stocks
      const rawStocks = await this.holdingAppService.getAllRawHoldings();
      const responsePayload = {
        success: true,
        stocks: rawStocks.map(s => ({
          id: s.id,
          staffId: s.staffId,
          staffName: s.staffName,
          location: s.location,
          count: s.count,
          updatedAt: s.updatedAt
        }))
      };

      return FieldApiMapper.toSuccessResponse(responsePayload, request, context);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
