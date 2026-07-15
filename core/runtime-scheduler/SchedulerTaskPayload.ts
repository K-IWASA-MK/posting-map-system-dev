import { LauncherResult } from '../launcher/LauncherResult';
import { ExecutionConfig } from '../launcher-runtime/ExecutionConfig';
import { PluginExecutionContext } from '../plugin-runtime/PluginExecutionContext';

/**
 * SchedulerTaskPayload aggregates metadata and execution settings required to spin up the target session.
 */
export interface SchedulerTaskPayload {
  readonly launcherResult: LauncherResult;
  readonly executionConfig: ExecutionConfig;
  readonly pluginContext?: PluginExecutionContext;
}
