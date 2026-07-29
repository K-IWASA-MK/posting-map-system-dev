/**
 * PipelineOptions.ts
 * 
 * Feature flags and configuration options for the Execution Pipeline.
 * Defaults are all false (disabled).
 */
export interface PipelineOptions {
  readonly enableAudit?: boolean;
  readonly enableMetrics?: boolean;
  readonly enableTracing?: boolean;
  readonly enableEvents?: boolean;
}

export const DEFAULT_PIPELINE_OPTIONS: PipelineOptions = Object.freeze({
  enableAudit: false,
  enableMetrics: false,
  enableTracing: false,
  enableEvents: false
});
