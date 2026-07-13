import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { HoldingApplicationService } from '@application/field/services/HoldingApplicationService';
import { FieldApiMapper } from './FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class FieldStockHandler implements EndpointHandler {
  constructor(private holdingAppService: HoldingApplicationService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      // Maps path variable id to staffNo to query their self-declared holding
      const staffNo = request.pathParams.id;
      if (!staffNo || staffNo.trim().length === 0) {
        throw new Error('id is required');
      }

      const dto = await this.holdingAppService.getHolding(staffNo);
      if (!dto) {
        throw new Error(`Flyer holding not found for staff: ${staffNo}`);
      }

      // Convert HoldingDto to backward-compatible shape for stocks
      const stockDto = {
        id: dto.staffNo,
        ownerId: dto.staffNo,
        areaId: 'default-area',
        quantity: dto.quantity,
        status: 'AVAILABLE',
        updatedAt: dto.updatedAt
      };

      return FieldApiMapper.toSuccessResponse(stockDto, request, context);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
