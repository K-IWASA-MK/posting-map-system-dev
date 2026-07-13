import { ApiException } from '@core/exceptions/ApiException';
import { ExceptionCategory } from '@core/exceptions/ExceptionCategory';
import { ExceptionMetadata } from '@core/exceptions/ExceptionMetadata';

export class FieldApiException extends ApiException {
  public readonly category: ExceptionCategory;
  public readonly code: string;
  public readonly status: number;

  constructor(params: {
    category: ExceptionCategory;
    code: string;
    status: number;
    internalMessage: string;
    externalMessage: string;
    requestId: string;
  }) {
    super({
      internalMessage: params.internalMessage,
      externalMessage: params.externalMessage,
      metadata: {
        timestamp: Date.now(),
        requestId: params.requestId,
        exceptionType: 'FieldApiException',
        exceptionCode: params.code,
        source: 'api'
      }
    });
    this.category = params.category;
    this.code = params.code;
    this.status = params.status;
  }
}
