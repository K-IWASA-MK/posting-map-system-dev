import { LauncherRequest } from './LauncherRequest';
import { LaunchDecision } from './LauncherResult';
import { ProjectMetadata } from '../project-manager/ProjectMetadata';

/**
 * LauncherPolicy evaluates launch eligibility rules as a stateless pure function.
 */
export class LauncherPolicy {
  /**
   * Evaluates launch safety constraints.
   * @param metadata Target project metadata from ProjectManager.
   * @param request Input parameters for the launch.
   */
  public static evaluatePolicy(
    metadata: ProjectMetadata,
    request: LauncherRequest
  ): { decision: LaunchDecision; reasons: string[]; errorCodes: string[] } {
    const reasons: string[] = [];
    const errorCodes: string[] = [];

    // Rule 1: Archived projects are blocked from launching
    if (metadata.lifecycle === 'archived') {
      reasons.push(`Project '${metadata.project.id}' is archived and cannot be launched.`);
      errorCodes.push('PROJECT_ARCHIVED');
    }

    // Rule 2: Filesystem structure layout must be verified and valid
    if (!metadata.validation.valid) {
      const missing = metadata.validation.missingFiles.join(', ');
      reasons.push(`Project '${metadata.project.id}' has invalid file structure. Missing files: [${missing}].`);
      errorCodes.push('VALIDATION_FAILED');
    }

    const decision: LaunchDecision = reasons.length === 0 ? 'allow' : 'deny';

    return {
      decision,
      reasons,
      errorCodes
    };
  }
}
