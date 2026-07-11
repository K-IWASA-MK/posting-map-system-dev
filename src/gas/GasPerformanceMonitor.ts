export class GasPerformanceMonitor {
  private static instance: GasPerformanceMonitor | null = null;

  private spreadsheetReads: number = 0;
  private spreadsheetWrites: number = 0;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private lockWaitTime: number = 0;
  private lockAcquires: number = 0;

  private constructor() {}

  public static getInstance(): GasPerformanceMonitor {
    if (!GasPerformanceMonitor.instance) {
      GasPerformanceMonitor.instance = new GasPerformanceMonitor();
    }
    return GasPerformanceMonitor.instance;
  }

  public recordSpreadsheetRead(): void {
    this.spreadsheetReads++;
  }

  public recordSpreadsheetWrite(): void {
    this.spreadsheetWrites++;
  }

  public recordCacheHit(): void {
    this.cacheHits++;
  }

  public recordCacheMiss(): void {
    this.cacheMisses++;
  }

  public recordLockAcquired(waitTimeMs: number): void {
    this.lockAcquires++;
    this.lockWaitTime += waitTimeMs;
  }

  public reset(): void {
    this.spreadsheetReads = 0;
    this.spreadsheetWrites = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.lockWaitTime = 0;
    this.lockAcquires = 0;
  }

  public getMetrics() {
    return {
      spreadsheetReads: this.spreadsheetReads,
      spreadsheetWrites: this.spreadsheetWrites,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      lockWaitTime: this.lockWaitTime,
      lockAcquires: this.lockAcquires
    };
  }
}
