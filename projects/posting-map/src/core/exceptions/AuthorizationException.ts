import { ApiException } from './ApiException';
import { ExceptionCategory } from './ExceptionCategory';

export class AuthorizationException extends ApiException {
  public readonly category = ExceptionCategory.SYSTEM; // We map it as standard exception lifecycle
  public readonly code: string;
  public readonly status: number = 403;

  constructor(code: string, internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'AuthorizationException',
        exceptionCode: code,
        source: 'AUTHORIZATION_PIPELINE'
      }
    });
    this.code = code;
  }
}
