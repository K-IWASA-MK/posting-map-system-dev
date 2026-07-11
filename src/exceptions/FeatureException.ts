import { ApiException } from './ApiException';
import { ExceptionCategory } from './ExceptionCategory';

export class FeatureException extends ApiException {
  public readonly category = ExceptionCategory.FEATURE;
  public readonly code: string;
  public readonly status: number;

  constructor(codeOrMsg: string, internalMessageOrRequestId: string, requestIdOrDetails?: string) {
    let code: string;
    let internalMessage: string;
    let requestId: string;
    let status = 403;
    let externalMessage: string;

    if (codeOrMsg.startsWith('PM-')) {
      code = codeOrMsg;
      internalMessage = internalMessageOrRequestId;
      requestId = requestIdOrDetails || '';
      status = 403;
      externalMessage = internalMessage;
    } else {
      // Old style backward compatibility
      code = 'PM-FTR-001';
      internalMessage = codeOrMsg;
      requestId = internalMessageOrRequestId;
      status = 422;
      externalMessage = '指定された機能は現在無効化されています。';
    }

    super({
      internalMessage,
      externalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'FeatureException',
        exceptionCode: code,
        source: 'FEATURE_ACCESS_PIPELINE',
        details: requestIdOrDetails
      }
    });

    this.code = code;
    this.status = status;
  }
}
