/**
 * AIOSCallbackHandler.ts
 * Adapter connecting the Platform API Router to the AIOSCallbackReceiver.
 */
import { EndpointHandler } from '@core/api/handlers/EndpointHandler';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { AIOSCallbackReceiver } from './AIOSCallbackReceiver';
import { CallbackContext } from './CallbackContext';

export class AIOSCallbackHandler implements EndpointHandler {
  constructor(private receiver: AIOSCallbackReceiver) {}

  async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    const callbackContext: CallbackContext = {
      requestId: request.requestId,
      receivedAt: new Date(),
      source: 'api-router',
      remoteAddress: 'unknown',
      headers: request.query // Fallback headers from query params for GAS environment
    };

    // Extract payload from body or query
    const payload = request.body || request.query || {};

    const response = await this.receiver.receive(callbackContext, payload);

    return new ApiResponse({
      status: response.statusCode,
      success: response.statusCode >= 200 && response.statusCode < 300,
      data: {
        accepted: response.accepted,
        receivedAt: response.receivedAt,
        requestId: response.requestId,
        message: response.message
      },
      metadata: {
        requestId: request.requestId,
        serverTimestamp: Date.now(),
        processingTime: 0,
        version: 'v2'
      }
    });
  }
}
