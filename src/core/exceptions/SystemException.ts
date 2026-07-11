import { ApiException } from './ApiException';
import { ExceptionCategory } from './ExceptionCategory';
import { ExceptionMetadata } from './ExceptionMetadata';

export class SystemException extends ApiException {
  public readonly category = ExceptionCategory.SYSTEM;
  public readonly code = 'PM-SYS-001';
  public readonly status = 500;

  constructor(internalMessage: string, requestId: string, details?: string) {
    super({
      internalMessage,
      externalMessage: '予期しないシステムエラーが発生しました。',
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'SystemException',
        exceptionCode: 'PM-SYS-001',
        source: 'SYSTEM',
        details
      }
    });
  }
}
