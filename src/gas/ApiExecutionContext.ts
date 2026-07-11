export class ApiExecutionContext {
  private requestId: string;
  private executionId: string;
  private startTimestamp: number;
  private retryCount: number = 0;

  constructor() {
    this.startTimestamp = Date.now();
    this.requestId = `req-${this.startTimestamp}-${Math.random().toString(36).substr(2, 9)}`;
    this.executionId = `exec-${Math.random().toString(36).substr(2, 9)}`;
  }

  public getRequestId(): string {
    return this.requestId;
  }

  public getExecutionId(): string {
    return this.executionId;
  }

  public getStartTimestamp(): number {
    return this.startTimestamp;
  }

  public getElapsedTime(): number {
    return Date.now() - this.startTimestamp;
  }

  public getRetryCount(): number {
    return this.retryCount;
  }

  public incrementRetry(): void {
    this.retryCount++;
  }
}
