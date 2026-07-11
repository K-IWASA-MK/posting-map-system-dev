import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { DistributionApplicationService } from '@application/field/services/DistributionApplicationService';
import { FieldApiMapper } from './FieldApiMapper';
import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';

export class DistributorHandler implements EndpointHandler {
  constructor(private distributionAppService: DistributionApplicationService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const id = request.pathParams.id;
      if (!id || id.trim().length === 0) {
        throw new Error('id is required');
      }

      const dto = await this.distributionAppService.getDistributor(id);
      if (!dto) {
        throw new Error(`Distributor not found: ${id}`);
      }

      return FieldApiMapper.toSuccessResponse(dto, request, context);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}
