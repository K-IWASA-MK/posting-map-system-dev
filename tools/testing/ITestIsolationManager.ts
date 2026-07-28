import { SandboxContext, TestIsolationPolicy } from './SandboxContext';

/**
 * IsolationReport logs diagnostic details of the resources cleaned up after a test.
 */
export interface IsolationReport {
  testFile: string;
  timersReleased: number;
  listenersRemoved: number;
  registriesReset: number;
  moduleCacheCleared: number;
  filesRestored: number;
  totalTime: number; // in ms
}

/**
 * ITestIsolationManager coordinates registry reset, require cache clearing,
 * and global event loop resource reclamation.
 */
export interface ITestIsolationManager {
  /**
   * Prepares the execution environment for a test, tracking resources and backing up mock files.
   */
  prepare(testFile: string, strategyName: string, policy?: TestIsolationPolicy): Promise<SandboxContext>;

  /**
   * Performs absolute cleanup, restoring resources, clearing registries, and returning a diagnostic report.
   */
  cleanup(context: SandboxContext): Promise<IsolationReport>;
}
