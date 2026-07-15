import { Command } from '../models/protocol';
import { IWorker, IWorkerProvider } from '../models/runtime_ports';

/**
 * DefaultWorkerProvider
 * 
 * A simple implementation of IWorkerProvider that registers and resolves workers based on Command type.
 * In Generation 5, this will be expanded to evaluate Tenant, Trust, Policy, and Version.
 */
export class DefaultWorkerProvider implements IWorkerProvider {
  
  private readonly registry = new Map<string, IWorker>();

  /**
   * Registers a worker for a specific command type.
   */
  register(commandType: string, worker: IWorker): void {
    this.registry.set(commandType, worker);
  }

  /**
   * Resolves the appropriate worker based on the Command.
   * Currently uses command.type, but serves as the foundational hook for dynamic resolution.
   */
  get(command: Command): IWorker {
    const worker = this.registry.get(command.type);
    if (!worker) {
      throw new Error(`Worker not found for command type: ${command.type}`);
    }
    return worker;
  }
}
