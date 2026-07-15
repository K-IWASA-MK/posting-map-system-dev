import { PluginRuntimeConfig } from './PluginRuntimeConfig';
import { PluginPermission } from './PluginPermission';
import { PluginRuntimeError } from './PluginRuntimeErrors';
import { PluginSandbox } from './PluginSandbox';
import { PluginEnvironmentBindingsProvider } from './PluginEnvironmentBindingsProvider';
import { WorkspaceContextBuilder } from '../workspace-runtime/WorkspaceContextBuilder';
import { WorkspaceRuntimePreparer } from '../workspace-runtime/WorkspaceRuntimePreparer';
import { LauncherExecutionRuntime } from '../launcher-runtime/LauncherExecutionRuntime';
import { ExecutionSessionManager } from '../execution-session/ExecutionSessionManager';
import { ExecutionSession } from '../execution-session/ExecutionSession';
import { LauncherResult } from '../launcher/LauncherResult';
import * as fs from 'fs';

/**
 * PluginRuntime coordinates verification checks, workspace allocations, and spawns plugin sessions.
 * Conforms to: delegates physical spawns to Launcher Execution Runtime and delegates locks to Workspace Runtime.
 */
export class PluginRuntime {
  private readonly preparer: WorkspaceRuntimePreparer;
  private readonly runtime: LauncherExecutionRuntime;
  private readonly sessionManager: ExecutionSessionManager;

  constructor(
    preparer: WorkspaceRuntimePreparer,
    runtime: LauncherExecutionRuntime,
    sessionManager: ExecutionSessionManager
  ) {
    this.preparer = preparer;
    this.runtime = runtime;
    this.sessionManager = sessionManager;
  }

  /**
   * Evaluates sandbox permissions, prepares target workspace environment, and launches the execution session.
   * @param config Target plugin registration config parameters.
   * @param requestedPermissions Permissions requested for this execution session.
   * @param sessionId Session correlation ID.
   * @param workspacePath Target physical project workspace path.
   */
  public async executePlugin(
    config: PluginRuntimeConfig,
    requestedPermissions: PluginPermission[],
    sessionId: string,
    workspacePath: string
  ): Promise<ExecutionSession> {
    // 1. Sandbox evaluation
    const evalResult = PluginSandbox.validatePermissions(config, requestedPermissions);
    if (evalResult.decision === 'deny') {
      throw new PluginRuntimeError(
        'PLUGIN_PERMISSION_DENIED',
        `Plugin permission check failed. Unauthorized requests: ${evalResult.deniedPermissions.join(', ')}`
      );
    }

    // 2. Entrypoint file verification
    if (!fs.existsSync(config.entryPoint)) {
      throw new PluginRuntimeError(
        'PLUGIN_ENTRYPOINT_NOT_FOUND',
        `Plugin entrypoint file '${config.entryPoint}' not found.`
      );
    }

    // 3. Environment mapping and execution delegation
    try {
      const pluginEnv = PluginEnvironmentBindingsProvider.buildEnv(requestedPermissions, config.env);
      const wsContext = WorkspaceContextBuilder.build(
        sessionId,
        config.pluginId,
        workspacePath,
        pluginEnv
      );

      // Preparer handles mkdir / locking logic
      await this.preparer.prepare(wsContext);

      // Launcher Result mock mapping
      const launcherResultMock: LauncherResult = {
        success: true,
        projectId: config.pluginId,
        mode: 'development',
        decision: 'allow',
        reasons: [],
        errorCodes: [],
        warnings: []
      };

      // Spawns the node process running the plugin entrypoint script
      const proc = await this.runtime.execute(launcherResultMock, {
        args: [config.entryPoint],
        env: wsContext.envBindings
      });

      // Wrap in monitoring session
      return this.sessionManager.createSession(proc);
    } catch (err: any) {
      if (err instanceof PluginRuntimeError) {
        throw err;
      }
      throw new PluginRuntimeError(
        'PLUGIN_RUNTIME_INITIALIZATION_FAILED',
        `Initialization of plugin runtime failed. ${err.message}`
      );
    }
  }
}
