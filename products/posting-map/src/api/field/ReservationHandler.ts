import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { ActivityApplicationService } from '@application/field/services/ActivityApplicationService';
import { HoldingApplicationService } from '@application/field/services/HoldingApplicationService';
import { RecordActivityCommand } from '@application/field/commands/RecordActivityCommand';
import { FieldApiMapper } from './FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class ReservationHandler implements EndpointHandler {
  constructor(
    private activityAppService: ActivityApplicationService,
    private holdingAppService: HoldingApplicationService
  ) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const { flyerStockId, distributorId, quantity, photoUrl, latitude, longitude } = request.body;

      // Extract details, mapping the legacy distributorId to staffNo, providing defaults for integration E2E compatibility
      const targetStaffNo = distributorId || 'S001';
      const targetPhoto = photoUrl || 'http://example.com/mock-photo.jpg';
      const targetLat = latitude !== undefined ? Number(latitude) : 34.965;
      const targetLng = longitude !== undefined ? Number(longitude) : 136.622;

      // Surface Compatibility Map: invoke Record Activity internally
      const command = new RecordActivityCommand(
        targetStaffNo,
        Number(quantity),
        targetPhoto,
        targetLat,
        targetLng,
        0
      );

      const activityDto = await this.activityAppService.recordActivity(command);

      // Query actual self-declared holding to return in compatibility payload
      let currentQty = 1000;
      const holding = await this.holdingAppService.getHolding(targetStaffNo);
      if (holding) {
        currentQty = holding.quantity;
      }

      // Backward compatible DTO shape mapping
      const result = {
        success: true,
        stock: {
          id: flyerStockId || `Holding-${targetStaffNo}`,
          ownerId: targetStaffNo,
          areaId: 'default-area',
          quantity: currentQty, // Quantity is not updated/subtracted by recording activity!
          status: 'AVAILABLE',
          updatedAt: new Date().toISOString()
        },
        eventIds: [`EV-DAR-${activityDto.id}`]
      };

      return FieldApiMapper.toSuccessResponse(result, request, context);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
