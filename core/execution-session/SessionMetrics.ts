/**
 * SessionMetrics registers runtime diagnostic logs and hardware metrics during session lifecycle.
 */
export interface SessionMetrics {
  stdoutLines: number;
  stderrLines: number;
  cpuTimeMs?: number;
  memoryPeakBytes?: number;
  bytesRead?: number;
  bytesWritten?: number;
}
