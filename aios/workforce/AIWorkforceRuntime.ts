import { AIWorkforceContext } from './AIWorkforceContext';

export interface AIWorkforceRuntime {
  readonly runtimeId: string;
  readonly context: AIWorkforceContext;
  readonly version: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
