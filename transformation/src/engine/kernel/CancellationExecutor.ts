import { CancellationToken } from '../../models/kernel';

export class CancellationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CancellationError';
  }
}

/**
 * CancellationExecutor
 * Wraps a promise and rejects it immediately if cancellation is requested,
 * or if cancellation occurs during the execution.
 */
export class CancellationExecutor {
  static async execute<T>(
    cancellationToken: CancellationToken,
    operation: () => Promise<T>
  ): Promise<T> {
    if (cancellationToken.isCancellationRequested) {
      throw new CancellationError('Execution cancelled before starting.');
    }

    return new Promise<T>((resolve, reject) => {
      let isCompleted = false;

      // Register listener
      cancellationToken.onCancellationRequested(() => {
        if (!isCompleted) {
          reject(new CancellationError('Execution cancelled during operation.'));
        }
      });

      operation()
        .then((result) => {
          isCompleted = true;
          resolve(result);
        })
        .catch((error) => {
          isCompleted = true;
          reject(error);
        });
    });
  }
}
