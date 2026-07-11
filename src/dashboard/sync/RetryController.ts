/**
 * RetryController.ts
 * 
 * 通信一時エラーなどの障害に対応するための、
 * 最大試行制限（Limit）付きの指数バックオフ（Exponential Backoff）リトライ制御ロジック。
 */
export class RetryController {
  private readonly maxRetries: number;
  private readonly initialDelayMs: number;
  private readonly factor: number;

  constructor(maxRetries = 3, initialDelayMs = 1000, factor = 2) {
    this.maxRetries = maxRetries;
    this.initialDelayMs = initialDelayMs;
    this.factor = factor;
  }

  /**
   * 与えられた非同期処理をリトライ付きで実行する。
   * 
   * @param task 実行する非同期関数
   * @param onRetry リトライ待機に入る直前のコールバック (エラー内容, 試行回数, 次回遅延ミリ秒)
   */
  async execute<T>(
    task: () => Promise<T>,
    onRetry?: (error: any, attempt: number, nextDelayMs: number) => void
  ): Promise<T> {
    let attempt = 0;

    while (true) {
      try {
        return await task();
      } catch (err) {
        attempt++;

        // 限界回数に達した場合はエラーを上方にスロー
        if (attempt >= this.maxRetries) {
          console.error(`[RetryController] Execution failed after maximum attempts (${this.maxRetries}).`);
          throw err;
        }

        // 次回遅延ミリ秒の算出 (InitialDelay * Factor^(Attempt-1))
        const delay = this.initialDelayMs * Math.pow(this.factor, attempt - 1);
        console.warn(`[RetryController] Operation failed. Retrying in ${delay}ms... (Attempt ${attempt}/${this.maxRetries})`);

        if (onRetry) {
          try {
            onRetry(err, attempt, delay);
          } catch (callbackErr) {
            console.error('[RetryController] Error in onRetry callback:', callbackErr);
          }
        }

        // 待機実行
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
