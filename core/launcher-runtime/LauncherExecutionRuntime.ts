import { LauncherResult } from '../launcher/LauncherResult';
import { IExecutionProcess } from './IExecutionProcess';
import { NodeExecutionProcess } from './NodeExecutionProcess';
import { ExecutionConfig } from './ExecutionConfig';
import { spawn } from 'child_process';
import { ContainerLauncher } from '../../sdk/core/container/ContainerLauncher';
import { SandboxEngine } from '../../sdk/core/sandbox/SandboxEngine';
import { AIOSEventBus } from '../../sdk/core/event/AIOSEventBus';
import { ContainerDefinition, RuntimeClass } from '../../sdk/core/container/ContainerDefinition';

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

    if (config?.checkQueue && !config?.queueId) {
      throw new Error(
        'Orchestration Violation: Execution must go through ExecutionQueue (Orchestration Before Execution)'
      );
    }

    if (config?.useContainer) {
      const eventBus = new AIOSEventBus();
      const sandboxEngine = new SandboxEngine(eventBus);
      const launcher = new ContainerLauncher(eventBus, sandboxEngine);

      const quota = config.resourceQuota || {
        quotaId: 'Q-MOCK',
        cpuLimit: 80,
        memoryLimit: 1024,
        gpuLimit: 0,
        storageLimit: 10,
        networkLimit: 100
      };

      const containerDef: ContainerDefinition = {
        containerId: config.containerId || `container-${Date.now()}`,
        image: config.image || 'node:18-alpine',
        entrypoint: config.args || [],
        environment: config.env || {},
        volumes: [],
        network: 'bridge',
        resourceQuota: quota,
        sandboxProfile: config.sandboxProfile || 'LIMITED_NETWORK'
      };

      await launcher.launch(containerDef);
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
