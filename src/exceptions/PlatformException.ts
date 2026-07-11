import { ApiException } from './ApiException';
import { ExceptionCategory } from './ExceptionCategory';

export class PlatformException extends ApiException {
  public readonly category: ExceptionCategory = 'SYSTEM';
  public readonly code: string;
  public readonly status: number = 500;

  constructor(code: 'PM-PLT-001' | 'PM-PLT-002' | 'PM-PLT-003', internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'PlatformException',
        exceptionCode: code,
        source: 'PLATFORM_INTEGRATION_PIPELINE'
      }
    });
    this.code = code;
  }
}
