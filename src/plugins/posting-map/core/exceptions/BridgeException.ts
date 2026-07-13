import { ApiException } from './ApiException';
import { ExceptionCategory } from './ExceptionCategory';

export class BridgeException extends ApiException {
  public readonly category = ExceptionCategory.SYSTEM;
  public readonly code: string;
  public readonly status: number = 503; // Service Unavailable default

  constructor(code: string, internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'BridgeException',
        exceptionCode: code,
        source: 'AIOS_BRIDGE_PIPELINE'
      }
    });
    this.code = code;
  }
}
