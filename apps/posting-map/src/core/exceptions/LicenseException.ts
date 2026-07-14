import { ApiException } from './ApiException';
import { ExceptionCategory } from './ExceptionCategory';

export class LicenseException extends ApiException {
  public readonly category = ExceptionCategory.SYSTEM;
  public readonly code: string;
  public readonly status: number = 402; // Payment Required default (configured toggles can map it)

  constructor(code: string, internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'LicenseException',
        exceptionCode: code,
        source: 'LICENSING_PIPELINE'
      }
    });
    this.code = code;
  }
}
