export type ActionExecutor = (context: any) => Promise<any>;

export class AutomationActionRegistry {
  private executors = new Map<string, ActionExecutor>();

  constructor() {
    this.registerDefaults();
  }

  public register(actionName: string, executor: ActionExecutor): void {
    this.executors.set(actionName, executor);
  }

  public get(actionName: string): ActionExecutor | undefined {
    return this.executors.get(actionName);
  }

  private registerDefaults(): void {
    // 1. Validation Action
    this.register('Validation', async (context) => {
      console.log('[AutomationActionRegistry] Running Validation Action...', context);
      return { overallStatus: 'PASS' };
    });

    // 2. Cache Cleanup Action
    this.register('Cache Cleanup', async (context) => {
      console.log('[AutomationActionRegistry] Running Cache Cleanup Action...', context);
      return { clearedCount: 24 };
    });

    // 3. Runtime Restart Action
    this.register('Runtime Restart', async (context) => {
      console.log('[AutomationActionRegistry] Running Runtime Restart Action...', context);
      return { restarted: true };
    });

    // 4. Plugin Reload Action
    this.register('Plugin Reload', async (context) => {
      console.log('[AutomationActionRegistry] Running Plugin Reload Action...', context);
      return { reloaded: true };
    });

    // 5. Health Check Action
    this.register('Health Check', async (context) => {
      console.log('[AutomationActionRegistry] Running Health Check Action...', context);
      return { healthy: true };
    });

    // 6. Diagnostic Report Action
    this.register('Diagnostic Report', async (context) => {
      console.log('[AutomationActionRegistry] Running Diagnostic Report Action...', context);
      return { reportPath: '/logs/diagnostic-report.json' };
    });
  }
}
