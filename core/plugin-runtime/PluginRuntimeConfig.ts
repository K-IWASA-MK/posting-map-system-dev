import { PluginPermission } from './PluginPermission';

/**
 * PluginRuntimeConfig defines settings and bounds specified for a plugin execution session.
 */
export interface PluginRuntimeConfig {
  readonly pluginId: string;
  readonly entryPoint: string;
  readonly allowedPermissions: PluginPermission[];
  readonly env?: Record<string, string>;
}
