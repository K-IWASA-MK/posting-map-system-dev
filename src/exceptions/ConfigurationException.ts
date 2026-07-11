import { ApiException } from './ApiException';
import { ExceptionCategory } from './ExceptionCategory';
import { ExceptionMetadata } from './ExceptionMetadata';

export class ConfigurationException extends ApiException {
  public readonly category = ExceptionCategory.CONFIGURATION;
  public readonly code = 'PM-CFG-001';
  public readonly status = 500;

  constructor(internalMessage: string, requestId: string, details?: string) {
    super({
      internalMessage,
      externalMessage: 'システム設定エラーが発生しました。',
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'ConfigurationException',
        exceptionCode: 'PM-CFG-001',
        source: 'CONFIGURATION',
        details
      }
    });
  }
}
