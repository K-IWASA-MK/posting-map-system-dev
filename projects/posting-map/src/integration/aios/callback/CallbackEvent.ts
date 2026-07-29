/**
 * CallbackEvent.ts
 * Definitions for Callback auditing events.
 */

export const CallbackEventTypes = {
  TASK_RESULT_RECEIVED: 'TASK_RESULT_RECEIVED',
  TASK_RESULT_VALIDATED: 'TASK_RESULT_VALIDATED',
  TASK_RESULT_ACCEPTED: 'TASK_RESULT_ACCEPTED',
  TASK_RESULT_REJECTED: 'TASK_RESULT_REJECTED'
} as const;

export type CallbackEventType = typeof CallbackEventTypes[keyof typeof CallbackEventTypes];

export interface CallbackEvent {
  readonly type: CallbackEventType;
  readonly timestamp: Date;
  readonly requestId: string;
  readonly taskId?: string;
  readonly executionId?: string;
  readonly payload?: unknown;
  readonly reason?: string;
}
