export interface EventDispatchResult {
  readonly subscriberCount: number;
  readonly dispatchDurationMs: number;
  readonly success: boolean;
}
