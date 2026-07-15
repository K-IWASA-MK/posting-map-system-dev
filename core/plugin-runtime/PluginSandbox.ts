import { PluginRuntimeConfig } from './PluginRuntimeConfig';
import { PluginPermission } from './PluginPermission';

/**
 * PermissionEvaluationResult is returned from sandbox evaluation.
 */
export interface PermissionEvaluationResult {
  readonly decision: 'allow' | 'deny';
  readonly deniedPermissions: PluginPermission[];
  readonly warnings: string[];
}

/**
 * PluginSandbox validates plugin request operations against allowed runtime permissions.
 * Conforms to: Pure evaluation logic (does not throw exceptions directly).
 */
export class PluginSandbox {
  /**
   * Evaluates requested permissions against configuration parameters.
   * @param config Target plugin configuration boundaries.
   * @param requestedPermissions Security permissions requested for execution.
   */
  public static validatePermissions(
    config: PluginRuntimeConfig,
    requestedPermissions: PluginPermission[]
  ): PermissionEvaluationResult {
    const deniedPermissions: PluginPermission[] = [];
    const warnings: string[] = [];

    for (const requested of requestedPermissions) {
      if (!config.allowedPermissions.includes(requested)) {
        deniedPermissions.push(requested);
      }
    }

    const decision = deniedPermissions.length > 0 ? 'deny' : 'allow';

    return {
      decision,
      deniedPermissions,
      warnings
    };
  }
}
