import { ApiException } from './ApiException';
import { ExceptionCategory } from './ExceptionCategory';
import { ExceptionMetadata } from './ExceptionMetadata';

export class RoutingException extends ApiException {
  public readonly category = ExceptionCategory.ROUTING;
  public readonly code: string;
  public readonly status: number;

  constructor(
    code: 'PM-RTE-001' | 'PM-RTE-002',
    status: 404 | 405,
    internalMessage: string,
    requestId: string,
    details?: string
  ) {
    super({
      internalMessage,
      externalMessage:
        status === 404
          ? '指定された API ルートが見つかりません。'
          : '指定された HTTP メソッドは許可されていません。',
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'RoutingException',
        exceptionCode: code,
        source: 'ROUTING',
        details
      }
    });
    this.code = code;
    this.status = status;
  }

  public static notFound(internalMessage: string, requestId: string, details?: string): RoutingException {
    return new RoutingException('PM-RTE-001', 404, internalMessage, requestId, details);
  }

  public static methodNotAllowed(internalMessage: string, requestId: string, details?: string): RoutingException {
    return new RoutingException('PM-RTE-002', 405, internalMessage, requestId, details);
  }
}
