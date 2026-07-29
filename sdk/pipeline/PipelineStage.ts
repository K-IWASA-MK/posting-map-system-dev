/**
 * PipelineStage.ts
 * 
 * Standard stages of the Execution Pipeline.
 * Used for auditing, visualization, and context tracking, not for control flow.
 */
export type PipelineStage = 
  | 'GATEWAY'
  | 'DISPATCH'
  | 'RUNTIME'
  | 'RESULT_ADAPTER'
  | 'COMPLETED';
