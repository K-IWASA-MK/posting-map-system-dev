import { WorkspaceContext } from '../workspace-runtime/WorkspaceContext';
import { PluginRuntimeConfig } from './PluginRuntimeConfig';
import { PluginPermission } from './PluginPermission';

/**
 * PluginExecutionContext encapsulates all environmental and configuration data for a plugin.
 */
export interface PluginExecutionContext {
  readonly workspaceContext: WorkspaceContext;
  readonly config: PluginRuntimeConfig;
  readonly requestedPermissions: PluginPermission[];
}
