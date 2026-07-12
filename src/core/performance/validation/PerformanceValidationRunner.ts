import * as fs from 'fs';
import * as path from 'path';
import { PerformancePolicyEngine } from '../policy/PerformancePolicyEngine';
import { PolicyContext } from '../policy/PerformancePolicy';
import { PerformanceValidationResult, PerformanceValidationMetadata } from './PerformanceValidationResult';
import { PerformanceValidationSummary, PerformanceValidationStatus } from './PerformanceValidationSummary';
import { RepositoryPerformanceProfiler, RepositoryPerformanceMetrics } from '../../../infrastructure/repository/profiler/RepositoryPerformanceProfiler';

export class PerformanceValidationRunner {
  private engine: PerformancePolicyEngine;

  constructor() {
    this.engine = new PerformancePolicyEngine();
  }

  /**
   * Run the validation process for the given source directory.
   */
  public run(sourceDirectory: string): PerformanceValidationResult {
    const startTime = Date.now();
    const generatedAt = new Date().toISOString();

    // 1. Gather contexts
    const contexts = this.gatherContexts(sourceDirectory);

    // 2. Try to get metrics from profiler (if executed in a runtime flow, otherwise it might be 0)
    let metrics: RepositoryPerformanceMetrics | undefined = undefined;
    try {
      const profiler = RepositoryPerformanceProfiler.getInstance();
      metrics = profiler.getMetrics();
      // Only include metrics if there is some activity
      if (metrics.totalExecutionTimeMs === 0 && metrics.repositoryCallCount === 0) {
        metrics = undefined;
      }
    } catch (e) {
      metrics = undefined; // Profiler not initialized or error
    }

    // Attach metrics to contexts if available (Policy can use them)
    if (metrics) {
      for (const ctx of contexts) {
        ctx.metrics = metrics;
      }
    }

    // 3. Execute Engine
    const report = this.engine.validate(contexts);

    // 4. Generate Summary
    const durationMs = Date.now() - startTime;
    let status: PerformanceValidationStatus = 'PASS';
    if (report.failed > 0) {
      status = 'FAILED';
    } else if (report.warning > 0) {
      status = 'WARNING';
    }

    const summary: PerformanceValidationSummary = {
      status,
      validationCount: report.policyCount,
      passed: report.pass,
      warning: report.warning,
      failed: report.failed,
      info: report.info,
      score: report.score,
      durationMs,
      generatedAt
    };

    // 5. Generate Metadata
    const metadata: PerformanceValidationMetadata = {
      toolVersion: '1.0.0',
      schemaVersion: 'v1',
      runtime: 'Node.js',
      generatedAt
    };

    // 6. Return Result
    return {
      metadata,
      summary,
      metrics,
      report
    };
  }

  private gatherContexts(dir: string): PolicyContext[] {
    const contexts: PolicyContext[] = [];
    const walkDir = (currentDir: string) => {
      if (!fs.existsSync(currentDir)) return;
      const files = fs.readdirSync(currentDir);
      for (const file of files) {
        const fullPath = path.join(currentDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') && !fullPath.includes('.test.ts')) {
          const sourceCode = fs.readFileSync(fullPath, 'utf8');
          contexts.push({ filePath: fullPath, sourceCode });
        }
      }
    };
    walkDir(dir);
    return contexts;
  }
}
