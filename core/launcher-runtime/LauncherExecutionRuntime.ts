import { LauncherResult } from '../launcher/LauncherResult';
import { IExecutionProcess } from './IExecutionProcess';
import { NodeExecutionProcess } from './NodeExecutionProcess';
import { ExecutionConfig } from './ExecutionConfig';
import { spawn } from 'child_process';

/**
 * InvalidLauncherDecisionError is thrown when execution is requested on a denied result.
 */
export class InvalidLauncherDecisionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidLauncherDecisionError';
  }
}

/**
 * LauncherExecutionRuntime executes allowed launch requests.
 * Conforms to: Execution Runtime never evaluates policy.
 */
export class LauncherExecutionRuntime {
  /**
   * Spawns a process wrapper for an allowed project.
   * @param result Validated LauncherResult (must have decision === 'allow').
   * @param config Execution parameters like arguments, env, cwd.
   */
  public async execute(
    result: LauncherResult,
    config?: ExecutionConfig
  ): Promise<IExecutionProcess> {
    if (result.decision !== 'allow') {
      throw new InvalidLauncherDecisionError(
        `Launch request denied by Launcher Policy. Reasons: [${result.reasons.join(', ')}]`
      );
    }

    const processId = `proc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Default to running a simple non-terminating node event loop if no arguments are provided
    const args = config?.args || ['-e', 'setInterval(() => {}, 1000)'];
    const env = {
      ...process.env,
      ...(config?.env || {}),
      AIOS_PROJECT_ID: result.projectId,
      AIOS_LAUNCH_MODE: result.mode
    };

    const cwd = config?.cwd || process.cwd();

    const child = spawn('node', args, {
      cwd,
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    return new NodeExecutionProcess(result.projectId, processId, child);
  }
}
