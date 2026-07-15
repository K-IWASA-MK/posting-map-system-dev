import { IExecutionProcess } from './IExecutionProcess';
import { ChildProcess } from 'child_process';
import { Readable } from 'stream';

/**
 * NodeExecutionProcess implements IExecutionProcess wrapping a Node.js ChildProcess.
 */
export class NodeExecutionProcess implements IExecutionProcess {
  public readonly projectId: string;
  public readonly processId: string;
  public readonly pid: number;
  public readonly stdout: Readable;
  public readonly stderr: Readable;
  private readonly child: ChildProcess;

  constructor(projectId: string, processId: string, child: ChildProcess) {
    this.projectId = projectId;
    this.processId = processId;
    this.child = child;
    this.pid = child.pid || 0;
    this.stdout = child.stdout || new Readable({ read() {} });
    this.stderr = child.stderr || new Readable({ read() {} });
  }

  public async kill(signal: string = 'SIGTERM'): Promise<void> {
    return new Promise((resolve) => {
      if (this.child.killed || this.child.exitCode !== null) {
        return resolve();
      }

      this.child.once('exit', () => {
        resolve();
      });

      const success = this.child.kill(signal as any);
      if (!success) {
        resolve();
      }
    });
  }

  public onExit(callback: (code: number | null) => void): void {
    this.child.on('exit', (code) => {
      callback(code);
    });
  }
}
