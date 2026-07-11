export class GracefulDegradation {
  private static gracefulMode: boolean = false;

  public static setGracefulMode(enabled: boolean): void {
    GracefulDegradation.gracefulMode = enabled;
  }

  public static isGracefulMode(): boolean {
    return GracefulDegradation.gracefulMode;
  }

  public static shouldSkipMetrics(): boolean {
    return GracefulDegradation.gracefulMode;
  }

  public static shouldSkipAudits(): boolean {
    return GracefulDegradation.gracefulMode;
  }
}
