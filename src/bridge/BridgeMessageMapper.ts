import { ApiRequest } from '../api/ApiRequest';
import { BridgeMessage } from './BridgeMessage';

export class BridgeMessageMapper {
  /**
   * Translates incoming ApiRequest parameters to a standard BridgeMessage.
   */
  public static toBridgeMessage(request: ApiRequest): BridgeMessage {
    return new BridgeMessage({
      messageId: request.requestId || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      messageType: 'API_EXECUTION_REQUEST',
      timestamp: Date.now(),
      source: 'POSTING_MAP',
      destination: 'AIOS',
      payload: {
        method: request.method,
        path: request.path,
        query: request.query || {},
        body: request.body || {}
      },
      protocolVersion: '1.0',
      correlationId: request.requestId
    });
  }

  /**
   * Translates an AIOS response payload back to POSTING MAP representation (dummy/simple mapping).
   */
  public static fromBridgeMessage(message: BridgeMessage): Record<string, any> {
    return {
      success: true,
      responseCode: 'OK',
      payload: message.payload
    };
  }
}
