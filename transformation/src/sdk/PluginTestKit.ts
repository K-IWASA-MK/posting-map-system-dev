import { PluginContext, PluginServices, ILogger, IMetrics, ITracer } from './models';
import { ExecutionAttempt } from '../models/kernel';

export class MockLogger implements ILogger {
  public logs: { level: string, message: string, meta?: any }[] = [];

  info(message: string, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'info', message, meta });
  }
  warn(message: string, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'warn', message, meta });
  }
  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'error', message, meta });
  }
  debug(message: string, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'debug', message, meta });
  }
}

export class MockMetrics implements IMetrics {
  public increments: Record<string, number> = {};
  public gauges: Record<string, number> = {};
  public timings: Record<string, number> = {};

  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.increments[name] = (this.increments[name] || 0) + value;
  }
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.gauges[name] = value;
  }
  timing(name: string, valueMs: number, tags?: Record<string, string>): void {
    this.timings[name] = valueMs;
  }
}

export class MockTracer implements ITracer {
  public spans: { name: string, status: 'started' | 'ended', tags: Record<string, string> }[] = [];

  startSpan(name: string, tags?: Record<string, string>): void {
    this.spans.push({ name, status: 'started', tags: tags || {} });
  }
  endSpan(name: string): void {
    const span = this.spans.find(s => s.name === name && s.status === 'started');
    if (span) {
      span.status = 'ended';
    }
  }
  addTag(key: string, value: string): void {
    const activeSpan = this.spans.find(s => s.status === 'started');
    if (activeSpan) {
      activeSpan.tags[key] = value;
    }
  }
}

/**
 * PluginTestKit
 * 
 * Provides mock utilities for Plugin developers to write unit tests 
 * without needing the full OS Core or real infrastructure.
 */
export class PluginTestKit {
  
  static createMockServices(): PluginServices {
    return {
      logger: new MockLogger(),
      metrics: new MockMetrics(),
      tracer: new MockTracer()
    };
  }

  static createMockAttempt(executionId: string = 'test-exec-1', attempt: number = 1): ExecutionAttempt {
    return {
      executionId,
      attempt,
      startedAt: new Date().toISOString(),
      timeoutAt: new Date(Date.now() + 5000).toISOString()
    };
  }

  static createMockContext(executionId?: string): PluginContext {
    return {
      execution: this.createMockAttempt(executionId),
      services: this.createMockServices()
    };
  }
}
