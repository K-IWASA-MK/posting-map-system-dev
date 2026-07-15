import { LauncherRequest } from './LauncherRequest';
import { LauncherResult } from './LauncherResult';
import { ProjectManager } from '../project-manager/ProjectManager';
import { LauncherValidator } from './LauncherValidator';
import { LauncherPolicy } from './LauncherPolicy';

/**
 * Launcher coordinates G6-11 Launcher Foundation boot validation gates.
 * Conforming to the Constitution, it does NOT spawn processes or execute code.
 */
export class Launcher {
  /**
   * Evaluates if a project launch request is eligible to boot.
   * Orchestrates Validator and Policy checks sequentially.
   * @param request Input parameters containing target project ID and mode.
   * @param manager Current active ProjectManager instance.
   */
  public static verifyLaunch(request: LauncherRequest, manager: ProjectManager): LauncherResult {
    const metadata = manager.getProject(request?.projectId);
    
    // 1. Run Syntax and Existence Validations
    const validation = LauncherValidator.validate(request, metadata);
    if (!validation.valid) {
      return {
        success: false,
        projectId: request?.projectId,
        mode: request?.mode || 'development',
        decision: 'deny',
        reasons: validation.errors,
        errorCodes: validation.errorCodes,
        warnings: []
      };
    }

    // 2. Run Policy Validations (safe to assume metadata is defined due to validation check)
    const policyResult = LauncherPolicy.evaluatePolicy(metadata!, request);
    const success = policyResult.decision === 'allow';

    return {
      success,
      projectId: request.projectId,
      mode: request.mode,
      decision: policyResult.decision,
      reasons: policyResult.reasons,
      errorCodes: policyResult.errorCodes,
      warnings: [],
      bootTimestamp: success ? Date.now() : undefined
    };
  }
}
