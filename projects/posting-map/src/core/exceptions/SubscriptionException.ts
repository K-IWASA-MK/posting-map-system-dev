import { ApiException } from './ApiException';
import { ExceptionCategory } from './ExceptionCategory';

export class SubscriptionException extends ApiException {
  public readonly category = ExceptionCategory.SYSTEM;
  public readonly code: string;
  public readonly status: number = 403; // Forbidden

  constructor(code: string, internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'SubscriptionException',
        exceptionCode: code,
        source: 'SUBSCRIPTION_GATE'
      }
    });
    this.code = code;
  }
}
