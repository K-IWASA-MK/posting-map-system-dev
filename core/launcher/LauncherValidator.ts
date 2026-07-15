import { LauncherRequest } from './LauncherRequest';
import { ProjectMetadata } from '../project-manager/ProjectMetadata';

/**
 * LauncherValidator checks syntax, parameter existence, and project registration status.
 */
export class LauncherValidator {
  /**
   * Performs basic request syntax and existence validations.
   * @param request Input parameters for the launch.
   * @param metadata Project manager metadata (undefined if not registered).
   */
  public static validate(
    request: LauncherRequest,
    metadata: ProjectMetadata | undefined
  ): { valid: boolean; errors: string[]; errorCodes: string[] } {
    const errors: string[] = [];
    const errorCodes: string[] = [];

    if (!request || !request.projectId) {
      errors.push('Launch request is missing a valid projectId.');
      errorCodes.push('MISSING_PROJECT_ID');
      return { valid: false, errors, errorCodes };
    }

    if (!request.mode || (request.mode !== 'development' && request.mode !== 'production')) {
      errors.push(`Launch request contains invalid execution mode: '${request.mode}'`);
      errorCodes.push('INVALID_LAUNCH_MODE');
    }

    if (!metadata) {
      errors.push(`Project '${request.projectId}' is not registered under Project Manager.`);
      errorCodes.push('PROJECT_NOT_FOUND');
    }

    return {
      valid: errors.length === 0,
      errors,
      errorCodes
    };
  }
}
