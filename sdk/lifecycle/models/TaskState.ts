/**
 * TaskState.ts
 * 
 * AIOS Task Lifecycle State & Outcome Types
 * Unified vocabulary for Task execution progression and outcome status across AIOS.
 */

export type TaskState =
  | 'RECEIVED'
  | 'ASSIGNED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'IMPLEMENTATION_DONE'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'HANDOVER_READY'
  | 'COMPLETED'
  | 'CLOSED';

export type TaskOutcome =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REJECTED';
