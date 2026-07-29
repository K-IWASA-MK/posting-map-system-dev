/**
 * TaskStatus.ts
 * 
 * Standardized status enumeration for all executed Tasks in AIOS.
 * Runtime-specific statuses MUST be normalized to these values.
 */
export type TaskStatus = 
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'SKIPPED'
  | 'TIMEOUT'
  | 'PARTIAL_SUCCESS';
