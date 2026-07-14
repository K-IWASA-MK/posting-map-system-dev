import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { ActivityApplicationService } from '@application/field/services/ActivityApplicationService';
import { RecordFieldActivityCommand } from '@application/field/commands/RecordFieldActivityCommand';
import { FieldApiMapper } from './FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class ActivityHandler implements EndpointHandler {
  constructor(private activityAppService: ActivityApplicationService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const data = request.body || {};
      const action = data.action || request.query.action || 'updateRecordWithGPSPhoto';

      // Type normalization and fallback matching legacy parameters
      const isDoneVal = data.isDone === 'true' || data.isDone === true;
      const countVal = Number(data.count || 0);
      const photoDataVal = data.photoData || '';
      
      const latitudeVal = Number(data.latitude !== undefined ? data.latitude : (data.lat !== undefined ? data.lat : 0));
      const longitudeVal = Number(data.longitude !== undefined ? data.longitude : (data.lng !== undefined ? data.lng : 0));
      const accuracyVal = Number(data.accuracy !== undefined ? data.accuracy : 0);

      const staffIdVal = String(data.staffId || data.userId || '');
      const staffNameVal = String(data.staffName || 'Unknown');
      const areaNameVal = String(data.areaName || data.legacySheetName || 'UnknownArea');
      
      const rawRowId = data.rowId !== undefined ? data.rowId : (data.legacyRow !== undefined ? data.legacyRow : 0);
      const rowIdVal = Number(rawRowId);

      const command = new RecordFieldActivityCommand(
        action,
        isDoneVal,
        countVal,
        photoDataVal,
        latitudeVal,
        longitudeVal,
        accuracyVal,
        staffIdVal,
        staffNameVal,
        areaNameVal,
        rowIdVal,
        data.tenantId,
        data.branchId || data.branchCode
      );

      const dto = await this.activityAppService.recordFieldActivity(command);

      // Return backward-compatible response format
      const responsePayload = {
        success: true,
        status: 'ok',
        id: dto.id,
        photoUrl: dto.photoUrl !== 'none' ? dto.photoUrl : ''
      };

      return FieldApiMapper.toSuccessResponse(responsePayload, request, context);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
