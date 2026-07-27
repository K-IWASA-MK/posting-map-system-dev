import { SandboxAccessRequest, SandboxValidationResult } from './WorkforceExecutionTypes';

/**
 * SandboxBoundaryEnforcer is a pure evaluation layer.
 * It inspects file path access and tool permissions against allowed boundaries.
 * It does NOT make recovery or halt decisions (delegated to RecoveryPolicyEngine).
 */
export class SandboxBoundaryEnforcer {
  /**
   * Validates an access request against defined allowed paths and execution permissions.
   */
  public static validateAccess(
    request: SandboxAccessRequest,
    allowedPaths: readonly string[],
    executionPermissions: readonly string[]
  ): SandboxValidationResult {
    // 1. Path Access Validation
    if (request.path) {
      const targetPath = request.path;

      // Prevent Path Traversal
      if (targetPath.includes('../') || targetPath.includes('..\\') || targetPath === '..') {
        return {
          allowed: false,
          reason: `Path traversal attempt detected: '${targetPath}'`,
          violationType: "PATH_TRAVERSAL"
        };
      }

      // Check if path starts with any allowed path prefix
      const isPathAllowed = allowedPaths.some(allowed => {
        const normAllowed = allowed.replace(/^\.\//, '');
        const normTarget = targetPath.replace(/^\.\//, '');
        return normTarget.startsWith(normAllowed) || normAllowed === '*';
      });

      if (!isPathAllowed) {
        return {
          allowed: false,
          reason: `Access to path '${targetPath}' is not permitted by runtime policy. Allowed: [${allowedPaths.join(', ')}]`,
          violationType: "UNAUTHORIZED_PATH"
        };
      }
    }

    // 2. Execution Permission Validation
    if (request.permission) {
      const perm = request.permission;
      const isPermAllowed = executionPermissions.includes(perm) || executionPermissions.includes('*');

      if (!isPermAllowed) {
        return {
          allowed: false,
          reason: `Execution permission '${perm}' is not granted by runtime policy. Granted: [${executionPermissions.join(', ')}]`,
          violationType: "UNAUTHORIZED_PERMISSION"
        };
      }
    }

    return {
      allowed: true
    };
  }
}
