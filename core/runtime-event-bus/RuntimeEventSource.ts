/**
 * RuntimeEventSource identifies which architectural plane generated the event.
 */
export type RuntimeEventSource =
  | 'Launcher'
  | 'ExecutionRuntime'
  | 'ExecutionSession'
  | 'WorkspaceRuntime'
  | 'PluginRuntime'
  | 'Monitoring';
