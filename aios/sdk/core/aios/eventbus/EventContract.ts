export interface ExecutionStartedPayload {
  readonly executionId: string;
  readonly contextId: string;
  readonly triggerSource: string;
}

export interface ExecutionCompletedPayload {
  readonly executionId: string;
  readonly durationMs: number;
  readonly status: 'PASS' | 'WARNING' | 'FAILED';
}

export interface ExecutionFailedPayload {
  readonly executionId: string;
  readonly error: string;
}

export interface ExecutionCancelledPayload {
  readonly executionId: string;
  readonly reason: string;
}

export interface PluginStartedPayload {
  readonly pluginId: string;
  readonly executionId: string;
}

export interface PluginCompletedPayload {
  readonly pluginId: string;
  readonly executionId: string;
  readonly status: string;
}

export interface PluginFailedPayload {
  readonly pluginId: string;
  readonly executionId: string;
  readonly error: string;
}

export interface ValidationStartedPayload {
  readonly pipelineId: string;
  readonly executionId: string;
}

export interface ValidationCompletedPayload {
  readonly pipelineId: string;
  readonly executionId: string;
  readonly status: string;
}

export interface ValidationFailedPayload {
  readonly pipelineId: string;
  readonly executionId: string;
  readonly error: string;
}

export interface ReviewStartedPayload {
  readonly reviewerId: string;
  readonly executionId: string;
}

export interface ReviewCompletedPayload {
  readonly reviewerId: string;
  readonly executionId: string;
  readonly confidence: number;
}

export interface ReviewFailedPayload {
  readonly reviewerId: string;
  readonly executionId: string;
  readonly error: string;
}

export interface SystemBootPayload {
  readonly aiosVersion: string;
  readonly bootTime: string;
}

export interface SystemReadyPayload {
  readonly aiosVersion: string;
}

export interface SystemShutdownPayload {
  readonly shutdownTime: string;
}

export interface SystemErrorPayload {
  readonly error: string;
  readonly fatal: boolean;
}

export interface HealthChangedPayload {
  readonly oldState: string;
  readonly newState: string;
}
