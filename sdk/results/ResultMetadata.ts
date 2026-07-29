/**
 * ResultMetadata.ts
 * 
 * Container for isolating Runtime-specific details.
 * Prevents TaskResult from being polluted with implementation-specific fields.
 */
export interface ResultMetadata {
  readonly runtimeType?: string;
  readonly executorName?: string;
  readonly adapterName?: string;
  readonly correlationId?: string;
  readonly version?: string;
  
  // Runtimes may add extra context here, but it must be completely serializable.
  readonly [key: string]: unknown;
}
