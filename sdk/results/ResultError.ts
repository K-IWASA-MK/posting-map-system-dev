/**
 * ResultError.ts
 * 
 * Standardized error representation for AIOS TaskResults.
 * Runtime-specific exceptions should be serialized into this structure.
 */
export interface ResultError {
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly cause?: string;
  readonly details?: Record<string, unknown>;
}
