import { ApiRequest } from '../ApiRequest';
import { ApiResponse } from '../ApiResponse';
import { ApiExecutionContext } from '../../gas/ApiExecutionContext';

export interface EndpointHandler {
  execute(request: ApiRequest, context: ApiExecutionContext): ApiResponse;
}
