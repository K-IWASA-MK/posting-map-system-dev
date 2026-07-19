import { IRuntime } from '../IRuntime';
import { RuntimeState } from '../RuntimeState';
import { RuntimeCapability } from '../RuntimeCapability';
import { RuntimeStateMachine } from '../RuntimeStateMachine';

export interface RegisteredRuntimeEntry {
  readonly runtimeId: string;
  readonly runtimeType: string;
  readonly runtimeVersion: string;
  readonly capabilities: RuntimeCapability[];
  readonly runtime: IRuntime;
  readonly stateMachine: RuntimeStateMachine;
  readonly dependsOn: string[];
}

export class RuntimeRegistry {
  private entries = new Map<string, RegisteredRuntimeEntry>();

  public register(runtime: IRuntime, runtimeType: string): void {
    const runtimeId = runtime.id || runtime.descriptor.runtimeId;
    if (this.entries.has(runtimeId)) {
      throw new Error(`Runtime ${runtimeId} already registered`);
    }

    const stateMachine = new RuntimeStateMachine();
    stateMachine.transition(RuntimeState.REGISTERED).catch(() => {});

    // Collect dependencies from descriptor or dependsOn
    const dependsOn = runtime.dependsOn || runtime.descriptor.dependencies.map(d => d.runtimeId);

    this.entries.set(runtimeId, {
      runtimeId,
      runtimeType,
      runtimeVersion: runtime.version || runtime.descriptor.version,
      capabilities: runtime.descriptor.capabilities,
      runtime,
      stateMachine,
      dependsOn
    });
  }

  public deregister(runtimeId: string): void {
    if (!this.entries.has(runtimeId)) {
      throw new Error(`Runtime ${runtimeId} is not registered`);
    }
    this.entries.delete(runtimeId);
  }

  public get(runtimeId: string): RegisteredRuntimeEntry | undefined {
    return this.entries.get(runtimeId);
  }

  public list(): RegisteredRuntimeEntry[] {
    return Array.from(this.entries.values());
  }
}
