export class RetryPolicy {
  constructor(
    public readonly maxRetries: number = 3,
    public readonly baseDelayMs: number = 100
  ) {}

  /**
   * Executes a given operation with retry logic.
   * Separates the "How to retry" from the "What to retry" (Execution Kernel philosophy).
   */
  async execute<T>(operation: (attempt: number) => Promise<T>): Promise<T> {
    let attempt = 1;
    let lastError: Error | undefined;

    while (attempt <= this.maxRetries) {
      try {
        return await operation(attempt);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // Simple backoff
        const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        attempt++;
      }
    }

    throw new Error(`Operation failed after ${this.maxRetries} retries. Last error: ${lastError?.message}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
