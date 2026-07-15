import { IRuntime } from './IRuntime';
import { RuntimeDescriptor } from './RuntimeDescriptor';
import { RuntimeDependencyGraph } from './RuntimeDependencyGraph';
import { RuntimeContext } from './RuntimeContext';

export class RuntimeRegistry {
  private runtimes = new Map<string, IRuntime>();
  private activeRuntimes = new Set<string>();
  private dependencyGraph = new RuntimeDependencyGraph();

  public register(runtime: IRuntime): void {
    if (this.runtimes.has(runtime.descriptor.runtimeId)) {
      throw new Error(`Runtime ${runtime.descriptor.runtimeId} already registered`);
    }
    this.runtimes.set(runtime.descriptor.runtimeId, runtime);
    this.dependencyGraph.addRuntime(runtime.descriptor);
  }

  public get(runtimeId: string): IRuntime | undefined {
    return this.runtimes.get(runtimeId);
  }

  public list(): RuntimeDescriptor[] {
    return Array.from(this.runtimes.values()).map(r => r.descriptor);
  }

  public discover(): RuntimeDescriptor[] {
    // In a real system, this would scan the file system or plugins
    return this.list();
  }

  public async activate(context: RuntimeContext): Promise<void> {
    const bootOrder = this.dependencyGraph.getBootOrder();
    for (const runtimeId of bootOrder) {
      if (!this.activeRuntimes.has(runtimeId)) {
        const runtime = this.runtimes.get(runtimeId);
        if (runtime) {
          console.log(`[RuntimeRegistry] Activating runtime: ${runtimeId}`);
          await runtime.initialize(context);
          this.activeRuntimes.add(runtimeId);
        }
      }
    }
  }

  public async deactivate(): Promise<void> {
    const bootOrder = this.dependencyGraph.getBootOrder().reverse();
    for (const runtimeId of bootOrder) {
      if (this.activeRuntimes.has(runtimeId)) {
        const runtime = this.runtimes.get(runtimeId);
        if (runtime) {
          console.log(`[RuntimeRegistry] Deactivating runtime: ${runtimeId}`);
          await runtime.shutdown();
          this.activeRuntimes.delete(runtimeId);
        }
      }
    }
  }

  public async reload(context: RuntimeContext): Promise<void> {
    await this.deactivate();
    await this.activate(context);
  }
}
