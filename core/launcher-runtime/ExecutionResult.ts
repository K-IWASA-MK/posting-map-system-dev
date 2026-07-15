/**
 * ExecutionResult represents metadata for a successfully initiated process runtime session.
 */
export interface ExecutionResult {
  processId: string;
  pid: number;
  startedAt: number;
  status: 'running' | 'stopped' | 'failed';
  projectId: string;
  requestId?: string;
}
