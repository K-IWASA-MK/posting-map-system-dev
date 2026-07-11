import { ApiException } from './ApiException';
import { ExceptionCategory } from './ExceptionCategory';
import { ExceptionMetadata } from './ExceptionMetadata';

export class FeatureException extends ApiException {
  public readonly category = ExceptionCategory.FEATURE;
  public readonly code = 'PM-FTR-001';
  public readonly status = 422;

  constructor(internalMessage: string, requestId: string, details?: string) {
    super({
      internalMessage,
      externalMessage: '指定された機能は現在無効化されています。',
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'FeatureException',
        exceptionCode: 'PM-FTR-001',
        source: 'FEATURE',
        details
      }
    });
  }
}
