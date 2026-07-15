/**
 * RuntimeEventType specifies events dispatched across the platform lifecycle.
 */
export type RuntimeEventType =
  | 'LAUNCH_REQUESTED'
  | 'LAUNCH_DECIDED'
  | 'PROCESS_SPAWNED'
  | 'PROCESS_EXITED'
  | 'SESSION_CREATED'
  | 'SESSION_ACTIVE'
  | 'SESSION_COMPLETED'
  | 'SESSION_FAILED'
  | 'SESSION_TERMINATED'
  | 'WORKSPACE_PREPARED'
  | 'WORKSPACE_LOCKED'
  | 'WORKSPACE_TEARDOWN'
  | 'PLUGIN_EXECUTED'
  | 'PLUGIN_PERMISSION_DENIED';
