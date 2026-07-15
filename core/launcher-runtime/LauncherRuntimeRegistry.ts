import { IExecutionProcess } from './IExecutionProcess';

/**
 * LauncherRuntimeRegistry tracks active running processes in memory.
 * Conforms to: Runtime registry holds state only (does not spawn, kill, or audit).
 */
export class LauncherRuntimeRegistry {
  private readonly processes = new Map<string, IExecutionProcess>();

  /**
   * Adds an active process to the tracking registry.
   * @param process Running process representation.
   */
  public register(process: IExecutionProcess): void {
    if (!process || !process.processId) {
      throw new Error('Cannot register undefined process or missing processId.');
    }
    this.processes.set(process.processId, process);
  }

  /**
   * Removes a process from the tracking registry.
   * @param processId Unique process correlation identifier.
   */
  public remove(processId: string): boolean {
    return this.processes.delete(processId);
  }

  /**
   * Locates a tracked process by its unique ID.
   * @param processId Unique process correlation identifier.
   */
  public find(processId: string): IExecutionProcess | undefined {
    return this.processes.get(processId);
  }

  /**
   * Returns a copy of all currently tracked active processes.
   */
  public list(): IExecutionProcess[] {
    return Array.from(this.processes.values());
  }

  /**
   * Returns the count of currently tracked active processes.
   */
  public count(): number {
    return this.processes.size;
  }
}
