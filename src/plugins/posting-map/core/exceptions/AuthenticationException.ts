import { ApiException } from './ApiException';
import { ExceptionCategory } from './ExceptionCategory';

export class AuthenticationException extends ApiException {
  public readonly category = ExceptionCategory.AUTHENTICATION;
  public readonly code: string;
  public readonly status: number = 401;

  constructor(code: string, internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage, // For simple authentication, user-facing and internal can align or hide sensitive details
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'AuthenticationException',
        exceptionCode: code,
        source: 'AUTHENTICATION_PIPELINE'
      }
    });
    this.code = code;
  }
}
