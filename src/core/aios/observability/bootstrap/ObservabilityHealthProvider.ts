import { ObservabilityLifecycleManager, ObservabilityLifecycleState } from './ObservabilityLifecycleManager';
import { ComponentDescriptor } from './ComponentDescriptor';
import { ObservabilityRuntime } from './ObservabilityRuntime';

export class ObservabilityHealthProvider {
  private lifecycleManager: ObservabilityLifecycleManager;
  private runtimeGetter: () => ObservabilityRuntime | null;

  constructor(
    lifecycleManager: ObservabilityLifecycleManager,
    runtimeGetter: () => ObservabilityRuntime | null
  ) {
    this.lifecycleManager = lifecycleManager;
    this.runtimeGetter = runtimeGetter;
  }

  public getHealth(): Record<string, any> {
    const runtime = this.runtimeGetter();
    const status = this.lifecycleManager.getState();

    const components: ComponentDescriptor[] = [];
    if (runtime) {
      components.push(
        { name: 'EventBus', status: 'ACTIVE', version: '1.0.0', initialized: true },
        { name: 'Telemetry', status: 'ACTIVE', version: '1.0.0', initialized: true },
        { name: 'Projection', status: 'ACTIVE', version: '1.0.0', initialized: true },
        { name: 'Metrics', status: 'ACTIVE', version: '1.0.0', initialized: true },
        { name: 'LiveMonitor', status: 'ACTIVE', version: '1.0.0', initialized: true },
        { name: 'LearningSource', status: 'ACTIVE', version: '1.0.0', initialized: true }
      );
    }

    const uptimeMs = runtime ? Date.now() - new Date(runtime.bootTime).getTime() : 0;

    return Object.freeze({
      status,
      uptimeMs,
      bootTime: runtime ? runtime.bootTime : null,
      runtimeId: runtime ? runtime.runtimeId : null,
      components: Object.freeze(components.map(c => Object.freeze(c))),
      schemaVersion: '1.0.0'
    });
  }
}
