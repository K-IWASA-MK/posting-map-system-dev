import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { FlyerStockApplicationService } from '@application/field/services/FlyerStockApplicationService';
import { FieldApiMapper } from './FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class FieldStockHandler implements EndpointHandler {
  constructor(private flyerStockAppService: FlyerStockApplicationService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const id = request.pathParams.id;
      if (!id || id.trim().length === 0) {
        throw new Error('id is required');
      }

      const dto = await this.flyerStockAppService.getStock(id);
      if (!dto) {
        throw new Error(`Flyer stock not found: ${id}`);
      }

      return FieldApiMapper.toSuccessResponse(dto, request, context);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
