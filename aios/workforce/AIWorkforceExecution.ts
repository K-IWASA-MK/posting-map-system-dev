import { AIWorkforceExecutionContext } from './AIWorkforceExecutionContext';

export interface AIWorkforceExecution {
  readonly executionId: string;
  readonly context: AIWorkforceExecutionContext;
  readonly version: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
