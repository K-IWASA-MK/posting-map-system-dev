import { CancellationError } from './CancellationExecutor';
import { TimeoutError } from './TimeoutExecutor';

/**
 * RetryExecutor
 * Retries the given operation up to maxRetries times if it fails.
 * Does not retry if the error is a CancellationError.
 */
export class RetryExecutor {
  static async execute<T>(
    maxRetries: number,
    operation: (attempt: number) => Promise<T>
  ): Promise<T> {
    let lastError: unknown;
    
    // Attempt is 1-indexed, so we loop from 1 to maxRetries + 1
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await operation(attempt);
      } catch (error) {
        lastError = error;
        
        // Never retry if cancelled
        if (error instanceof CancellationError) {
          throw error;
        }

        // On the final attempt, throw the error instead of retrying
        if (attempt > maxRetries) {
          break;
        }
      }
    }

    throw lastError;
  }
}
