export enum RepositoryErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  CONNECTIVITY_ERROR = 'CONNECTIVITY_ERROR',
  TIMEOUT = 'TIMEOUT'
}

export interface RepositoryResult {
  success: boolean;
  operationId: string;
  message?: string;
  errorType?: RepositoryErrorType;
  details?: unknown;
}
