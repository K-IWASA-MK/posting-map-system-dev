export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * TimeoutExecutor
 * Wraps a promise and rejects it if it does not resolve within the specified timeout.
 */
export class TimeoutExecutor {
  static async execute<T>(
    timeoutMs: number,
    operation: () => Promise<T>,
    onTimeout?: () => void
  ): Promise<T> {
    if (timeoutMs <= 0) {
      return operation();
    }

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (onTimeout) onTimeout();
        reject(new TimeoutError(`Execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      operation()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}
