export enum ConsoleFailurePolicy {
  FAIL_FAST = 'FAIL_FAST',
  RETRY = 'RETRY',
  IGNORE = 'IGNORE'
}

export interface ConsolePolicy {
  maxRetries: number;
  backoffMs: number;
  failurePolicy: ConsoleFailurePolicy;
  eventRetentionCount: number;
  projectionUpdateIntervalMs: number;
}

export const DefaultConsolePolicy: ConsolePolicy = {
  maxRetries: 3,
  backoffMs: 1000,
  failurePolicy: ConsoleFailurePolicy.RETRY,
  eventRetentionCount: 1000, // keep last 1000 events
  projectionUpdateIntervalMs: 100 // debounce updates
};
