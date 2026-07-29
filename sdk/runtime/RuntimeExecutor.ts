import { ExecutionContext } from './ExecutionContext';
import { ExecutionResult } from './ExecutionResult';

/**
 * RuntimeExecutor.ts
 * 
 * Standardized interface for all Execution Runtime targets.
 * Enforces asynchronous execution returning a Promise<ExecutionResult>.
 */
export interface RuntimeExecutor {
  /**
   * The priority of this RuntimeExecutor.
   * ExecutionRuntime uses this to resolve conflicts when multiple Runtimes
   * report supports() === true. Higher numbers = higher priority.
   */
  readonly priority: number;

  /**
   * Evaluates whether this Runtime can execute the given context.
   */
  supports(context: ExecutionContext): boolean;

  /**
   * Asynchronously executes the given context and returns a standard ExecutionResult.
   */
  execute(context: ExecutionContext): Promise<ExecutionResult>;
}
