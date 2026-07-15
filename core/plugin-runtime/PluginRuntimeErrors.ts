/**
 * PluginErrorCode specifies structural plugin runtime error causes.
 */
export type PluginErrorCode =
  | 'PLUGIN_PERMISSION_DENIED'
  | 'PLUGIN_CONFIG_INVALID'
  | 'PLUGIN_ENTRYPOINT_NOT_FOUND'
  | 'PLUGIN_RUNTIME_INITIALIZATION_FAILED';

/**
 * PluginRuntimeError represents exceptions thrown in the plugin plane.
 */
export class PluginRuntimeError extends Error {
  public readonly errorCode: PluginErrorCode;

  constructor(errorCode: PluginErrorCode, message: string) {
    super(`[${errorCode}] ${message}`);
    this.name = 'PluginRuntimeError';
    this.errorCode = errorCode;
  }
}
