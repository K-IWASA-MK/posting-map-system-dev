/**
 * TestIsolationPolicy defines the level of strictness for resource cleanups.
 */
export type TestIsolationPolicy = 'Strict' | 'Balanced' | 'Fast';

/**
 * SandboxContext tracks the runtime state, capability requirements,
 * and active resource hooks for an individual test file execution.
 */
export interface SandboxContext {
  readonly testFile: string;
  readonly capabilities: string[];
  readonly strategyName: string;
  readonly startTime: number;
  readonly policy: TestIsolationPolicy;
  
  // Track files backed up to restore original state
  readonly backupMap: Map<string, string>;

  // Track active resources (diagnostics)
  readonly resourceIds: string[];

  // Dynamic cleanup tasks registered during the test run
  readonly cleanupTasks: Array<() => Promise<void> | void>;
}
