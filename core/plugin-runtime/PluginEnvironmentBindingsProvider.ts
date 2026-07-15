import { PluginPermission } from './PluginPermission';

/**
 * PluginEnvironmentBindingsProvider maps permission parameters to environment variables.
 */
export class PluginEnvironmentBindingsProvider {
  /**
   * Constructs the child process env overrides.
   * @param allowedPermissions Validated runtime permissions.
   * @param customEnv Base configurations.
   */
  public static buildEnv(
    allowedPermissions: PluginPermission[],
    customEnv?: Record<string, string>
  ): Record<string, string> {
    return {
      ...(customEnv || {}),
      AIOS_ALLOWED_PERMISSIONS: allowedPermissions.join(',')
    };
  }
}
