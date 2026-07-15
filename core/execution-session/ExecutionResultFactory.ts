import { ExecutionSession } from './ExecutionSession';
import { ExecutionResult } from '../launcher-runtime/ExecutionResult';

/**
 * ExecutionResultFactory extracts an immutable ExecutionResult snapshot from an active ExecutionSession.
 * Separates data projection from runtime session classes.
 */
export class ExecutionResultFactory {
  /**
   * Creates a static metadata snapshot.
   * @param session Target active ExecutionSession.
   */
  public static createSnapshot(session: ExecutionSession): ExecutionResult {
    let statusMapped: 'running' | 'stopped' | 'failed' = 'running';

    if (session.status === 'completed' || session.status === 'terminated') {
      statusMapped = 'stopped';
    } else if (session.status === 'failed') {
      statusMapped = 'failed';
    }

    return {
      processId: session.process.processId,
      pid: session.process.pid,
      startedAt: session.startedAt,
      status: statusMapped,
      projectId: session.projectId,
      requestId: session.requestId
    };
  }
}
