export enum PluginStatus {
  UNINITIALIZED = 'UNINITIALIZED',
  INITIALIZING = 'INITIALIZING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR'
}

export interface PluginHealth {
  readonly pluginId: string;
  readonly status: PluginStatus;
  readonly version: string;
  readonly startedAt?: string;
  readonly lastError?: Error;
}
