/**
 * LaunchMode specifies the execution context to run the project.
 */
export type LaunchMode = 'development' | 'production';

/**
 * LauncherRequest represents the parameters sent to initialize a project launch.
 */
export interface LauncherRequest {
  projectId: string;
  mode: LaunchMode;
  requestId?: string; // Optional correlation ID for tracing and logging
  env?: Record<string, string>;
}
