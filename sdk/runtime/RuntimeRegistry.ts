import { RuntimeExecutor } from './RuntimeExecutor';
import { ExecutionContext } from './ExecutionContext';

/**
 * RuntimeRegistry.ts
 * 
 * Registry for managing RuntimeExecutors.
 * Responsible ONLY for registration and lookup (priority-based).
 * Does not create or manage DI lifecycles of the executors themselves.
 */
export class RuntimeRegistry {
  private readonly runtimes: RuntimeExecutor[] = [];

  constructor(initialRuntimes: RuntimeExecutor[] = []) {
    initialRuntimes.forEach(r => this.register(r));
  }

  /**
   * Registers a new RuntimeExecutor.
   * Throws an error if a runtime of the exact same instance is already registered.
   */
  public register(runtime: RuntimeExecutor): void {
    if (this.runtimes.includes(runtime)) {
      throw new Error('[RuntimeRegistry] Runtime instance is already registered.');
    }
    this.runtimes.push(runtime);
    
    // Sort in descending order of priority
    this.runtimes.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Looks up the optimal RuntimeExecutor for the given ExecutionContext.
   * Relies on the pre-sorted priority order and supports() evaluation.
   */
  public lookup(context: ExecutionContext): RuntimeExecutor | undefined {
    return this.runtimes.find(r => r.supports(context));
  }

  /**
   * Returns a copy of the registered runtimes.
   */
  public getRegisteredRuntimes(): ReadonlyArray<RuntimeExecutor> {
    return Object.freeze([...this.runtimes]);
  }
}
