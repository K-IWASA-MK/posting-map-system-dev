export interface TestContext {
  readonly testFile: string;
  readonly strategyName: string;
  readonly policy: 'Strict' | 'Balanced' | 'Fast';
  registerCleanupTask(task: () => Promise<void> | void): void;
}

export interface ExecutionContext {
  readonly env: Record<string, string>;
  readonly capabilities: string[];
}

export interface TestMetadata {
  name?: string;
  timeout?: number;
  capabilities?: string[];
}

export interface TestExecutionContext {
  test: TestContext;
  execution: ExecutionContext;
}
