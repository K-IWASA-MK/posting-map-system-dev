import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { FlyerStockApplicationService } from '@application/field/services/FlyerStockApplicationService';
import { ReserveFlyerCommand } from '@application/field/commands/ReserveFlyerCommand';
import { FieldApiMapper } from './FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class ReservationHandler implements EndpointHandler {
  constructor(private flyerStockAppService: FlyerStockApplicationService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const { flyerStockId, distributorId, quantity } = request.body;

      // Command instantiation will execute input validation rules
      const command = new ReserveFlyerCommand(flyerStockId, distributorId, Number(quantity));

      const result = await this.flyerStockAppService.reserveStock(command);

      return FieldApiMapper.toSuccessResponse(result, request, context);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
