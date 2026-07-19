/**
 * ExecutionConfig defines options for starting a project process execution.
 */
export interface ExecutionConfig {
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  queueId?: string;
  checkQueue?: boolean;
}
