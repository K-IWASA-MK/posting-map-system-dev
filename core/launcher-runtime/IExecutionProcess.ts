import { Readable } from 'stream';

/**
 * IExecutionProcess abstracts a running process instance.
 * Decouples the platform from child_process ChildProcess native implementations.
 */
export interface IExecutionProcess {
  readonly projectId: string;
  readonly processId: string;
  readonly pid: number;
  readonly stdout: Readable;
  readonly stderr: Readable;
  kill(signal?: string): Promise<void>;
  onExit(callback: (code: number | null) => void): void;
}
