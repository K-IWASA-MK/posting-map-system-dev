/**
 * StageState.ts
 * 
 * Execution State Enum for Workflow Stages
 */

export enum StageState {
  PENDING = 'PENDING',
  READY = 'READY',
  RUNNING = 'RUNNING',
  WAITING = 'WAITING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}
