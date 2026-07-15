import { IExecutionProcess } from '../launcher-runtime/IExecutionProcess';
import { SessionMetrics } from './SessionMetrics';

/**
 * SessionStatus defines the states an execution session transitions through.
 */
export type SessionStatus = 'created' | 'active' | 'completed' | 'failed' | 'terminated';

/**
 * ExecutionSession manages the lifecycle state and telemetry of a running project process.
 */
export class ExecutionSession {
  public readonly sessionId: string;
  public readonly projectId: string;
  public readonly requestId?: string;
  public readonly process: IExecutionProcess;
  public readonly startedAt: number;
  public finishedAt?: number;
  public exitCode?: number | null;
  public status: SessionStatus = 'created';
  public readonly metrics: SessionMetrics = { stdoutLines: 0, stderrLines: 0 };

  constructor(
    sessionId: string,
    projectId: string,
    process: IExecutionProcess,
    requestId?: string
  ) {
    this.sessionId = sessionId;
    this.projectId = projectId;
    this.process = process;
    this.requestId = requestId;
    this.startedAt = Date.now();
  }

  /**
   * Activates the session monitoring of standard streams and exit codes.
   */
  public start(): void {
    if (this.status !== 'created') {
      return;
    }

    this.status = 'active';

    this.process.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      const linesCount = text.split(/\r?\n/).filter((line: string) => line.length > 0).length;
      this.metrics.stdoutLines += linesCount;
    });

    this.process.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      const linesCount = text.split(/\r?\n/).filter((line: string) => line.length > 0).length;
      this.metrics.stderrLines += linesCount;
    });

    this.process.onExit((code) => {
      this.handleExit(code);
    });
  }

  /**
   * Requests termination of the running process.
   * @param signal Standard kill signal.
   */
  public async stop(signal: string = 'SIGTERM'): Promise<void> {
    if (this.status === 'completed' || this.status === 'failed' || this.status === 'terminated') {
      return;
    }

    this.status = 'terminated';
    this.finishedAt = Date.now();
    await this.process.kill(signal);
  }

  private handleExit(code: number | null): void {
    if (this.status === 'completed' || this.status === 'failed' || this.status === 'terminated') {
      return;
    }

    this.finishedAt = Date.now();
    this.exitCode = code;
    this.status = code === 0 ? 'completed' : 'failed';
  }
}
