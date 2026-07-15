export interface SheetMetric {
  sheetName: string;
  readCount: number;
  writeCount: number;
}

export interface RepositoryMetric {
  repositoryName: string;
  executionCount: number;
}

export interface RepositoryPerformanceMetrics {
  repositoryCallCount: number; // 総リポジトリコール数
  spreadsheetReadCount: number; // 総リード数
  spreadsheetWriteCount: number; // 総ライト数
  totalExecutionTimeMs: number;
  repositoryExecutionCount: RepositoryMetric[]; // Repositoryごとの実行回数
  sheetMetrics: SheetMetric[]; // SheetごとのRead/Write数
}

export class RepositoryPerformanceProfiler {
  private static instance: RepositoryPerformanceProfiler;
  private metrics!: RepositoryPerformanceMetrics;

  private constructor() {
    this.reset();
  }

  public static getInstance(): RepositoryPerformanceProfiler {
    if (!RepositoryPerformanceProfiler.instance) {
      RepositoryPerformanceProfiler.instance = new RepositoryPerformanceProfiler();
    }
    return RepositoryPerformanceProfiler.instance;
  }

  public incrementRepositoryCall(repositoryName: string): void {
    this.metrics.repositoryCallCount++;
    const repoMetric = this.metrics.repositoryExecutionCount.find(m => m.repositoryName === repositoryName);
    if (repoMetric) {
      repoMetric.executionCount++;
    } else {
      this.metrics.repositoryExecutionCount.push({ repositoryName, executionCount: 1 });
    }
  }

  public incrementRead(sheetName: string): void {
    this.metrics.spreadsheetReadCount++;
    let sheetMetric = this.metrics.sheetMetrics.find(m => m.sheetName === sheetName);
    if (!sheetMetric) {
      sheetMetric = { sheetName, readCount: 0, writeCount: 0 };
      this.metrics.sheetMetrics.push(sheetMetric);
    }
    sheetMetric.readCount++;
  }

  public incrementWrite(sheetName: string): void {
    this.metrics.spreadsheetWriteCount++;
    let sheetMetric = this.metrics.sheetMetrics.find(m => m.sheetName === sheetName);
    if (!sheetMetric) {
      sheetMetric = { sheetName, readCount: 0, writeCount: 0 };
      this.metrics.sheetMetrics.push(sheetMetric);
    }
    sheetMetric.writeCount++;
  }

  public addExecutionTime(ms: number): void {
    this.metrics.totalExecutionTimeMs += ms;
  }

  public getMetrics(): RepositoryPerformanceMetrics {
    // Return deep copy to prevent external mutation
    return {
      repositoryCallCount: this.metrics.repositoryCallCount,
      spreadsheetReadCount: this.metrics.spreadsheetReadCount,
      spreadsheetWriteCount: this.metrics.spreadsheetWriteCount,
      totalExecutionTimeMs: this.metrics.totalExecutionTimeMs,
      repositoryExecutionCount: this.metrics.repositoryExecutionCount.map(m => ({ ...m })),
      sheetMetrics: this.metrics.sheetMetrics.map(m => ({ ...m }))
    };
  }

  public reset(): void {
    this.metrics = {
      repositoryCallCount: 0,
      spreadsheetReadCount: 0,
      spreadsheetWriteCount: 0,
      totalExecutionTimeMs: 0,
      repositoryExecutionCount: [],
      sheetMetrics: []
    };
  }
}
