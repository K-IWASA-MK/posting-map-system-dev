/**
 * DispatchResult contains parameters compiled after executing a queued dispatch attempt.
 */
export interface DispatchResult {
  readonly success: boolean;
  readonly sessionId?: string;
  readonly taskId: string;
  readonly startedAt: number;
}
