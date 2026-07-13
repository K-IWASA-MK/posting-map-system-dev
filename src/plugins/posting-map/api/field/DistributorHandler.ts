import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { StaffApplicationService } from '@application/field/services/StaffApplicationService';
import { RegisterStaffCommand } from '@application/field/commands/RegisterStaffCommand';
import { FieldApiMapper } from './FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class DistributorHandler implements EndpointHandler {
  constructor(private staffAppService: StaffApplicationService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      if (request.method === 'POST') {
        const body = request.body || {};
        const displayName = body.lastName || body.displayName || '';
        const lineUserId = body.lineUserId || '';
        const workspaceId = body.workspaceId || '';
        const staffNo = body.staffNo;

        const command = new RegisterStaffCommand(staffNo, displayName, lineUserId, workspaceId);
        const dto = await this.staffAppService.registerStaff(command);

        const result = {
          id: dto.staffNo,
          name: dto.displayName,
          identityId: dto.lineUserId,
          status: 'ACTIVE',
          areaIds: ['default-area']
        };
        return FieldApiMapper.toSuccessResponse(result, request, context);
      }

      const staffNo = request.pathParams.id;
      if (!staffNo || staffNo.trim().length === 0) {
        throw new Error('id is required');
      }

      const dto = await this.staffAppService.getStaff(staffNo);
      if (!dto) {
        throw new Error(`Staff not found: ${staffNo}`);
      }

      // Convert StaffDto to backward-compatible DistributorDto shape
      const distributorDto = {
        id: dto.staffNo,
        name: dto.displayName,
        identityId: dto.lineUserId,
        status: 'ACTIVE',
        areaIds: ['default-area']
      };

      return FieldApiMapper.toSuccessResponse(distributorDto, request, context);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
