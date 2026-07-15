import { ExecutionAttempt } from '../models/kernel';

export interface SdkDescriptor {
  readonly sdkVersion: string;
  readonly minimumApiVersion: string;
  readonly maximumApiVersion: string;
}

export interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

export interface IMetrics {
  increment(name: string, value?: number, tags?: Record<string, string>): void;
  gauge(name: string, value: number, tags?: Record<string, string>): void;
  timing(name: string, valueMs: number, tags?: Record<string, string>): void;
}

export interface ITracer {
  startSpan(name: string, tags?: Record<string, string>): void;
  endSpan(name: string): void;
  addTag(key: string, value: string): void;
}

export interface PluginServices {
  readonly logger: ILogger;
  readonly metrics: IMetrics;
  readonly tracer: ITracer;
}

export interface PluginContext {
  // Using ExecutionAttempt here since IWorker receives ExecutionAttempt from the Kernel
  // as per the Sprint X-21 Execution Model contract.
  readonly execution: ExecutionAttempt;
  readonly services: PluginServices;
}
