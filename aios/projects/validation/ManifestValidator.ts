import { ProjectManifest } from '../contracts/ProjectManifest';

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * ManifestValidator ensures that a given ProjectManifest object
 * conforms to the AIOS Universal Project Contract requirements.
 * It is kept separate from the contract definitions to enforce
 * the separation of declaration and evaluation.
 */
export class ManifestValidator {
  /**
   * Validates a ProjectManifest object against core requirements.
   *
   * @param manifest The parsed manifest to validate
   * @returns ValidationResult containing validation status and any errors
   */
  public static validate(manifest: Partial<ProjectManifest>): ValidationResult {
    const errors: string[] = [];

    if (!manifest.manifestVersion || typeof manifest.manifestVersion !== 'string') {
      errors.push("Missing or invalid 'manifestVersion'.");
    }

    if (!manifest.projectId || typeof manifest.projectId !== 'string' || manifest.projectId.trim() === '') {
      errors.push("Missing or invalid 'projectId'. It must be a non-empty string.");
    }

    if (!manifest.projectName || typeof manifest.projectName !== 'string') {
      errors.push("Missing or invalid 'projectName'.");
    }

    if (!Array.isArray(manifest.capabilities)) {
      errors.push("Missing or invalid 'capabilities'. It must be an array.");
    }

    if (!manifest.runtimePolicy || typeof manifest.runtimePolicy !== 'object') {
      errors.push("Missing or invalid 'runtimePolicy'.");
    } else {
      if (typeof manifest.runtimePolicy.sandboxRequired !== 'boolean') {
        errors.push("Invalid 'runtimePolicy.sandboxRequired'. It must be a boolean.");
      }

      if (!Array.isArray(manifest.runtimePolicy.allowedPaths)) {
        errors.push("Invalid 'runtimePolicy.allowedPaths'. It must be an array.");
      } else {
        // Prevent path traversal attempts
        manifest.runtimePolicy.allowedPaths.forEach(path => {
          if (path.includes('../') || path.includes('..\\') || path === '..') {
            errors.push(`Path traversal is not allowed in 'runtimePolicy.allowedPaths': ${path}`);
          }
        });
      }

      if (!Array.isArray(manifest.runtimePolicy.executionPermissions)) {
        errors.push("Invalid 'runtimePolicy.executionPermissions'. It must be an array.");
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
