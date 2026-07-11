export interface ExceptionMetadata {
  readonly requestId: string;
  readonly timestamp: number;
  readonly exceptionType: string;
  readonly exceptionCode: string;
  readonly source: string;
  readonly details?: string;
}
