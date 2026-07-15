import { RuntimeDescriptor } from './RuntimeDescriptor';

export class RuntimeDependencyGraph {
  private descriptors = new Map<string, RuntimeDescriptor>();

  public addRuntime(descriptor: RuntimeDescriptor): void {
    this.descriptors.set(descriptor.runtimeId, descriptor);
  }

  public removeRuntime(runtimeId: string): void {
    this.descriptors.delete(runtimeId);
  }

  public getBootOrder(): string[] {
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize graph
    for (const id of this.descriptors.keys()) {
      adj.set(id, []);
      inDegree.set(id, 0);
    }

    // Build edges (dependency -> dependent)
    for (const [id, desc] of this.descriptors.entries()) {
      for (const dep of desc.dependencies) {
        if (!this.descriptors.has(dep.runtimeId)) {
          if (dep.required) {
            throw new Error(`Missing required dependency: ${dep.runtimeId} for runtime ${id}`);
          }
          continue; // Skip optional missing
        }
        
        adj.get(dep.runtimeId)!.push(id);
        inDegree.set(id, inDegree.get(id)! + 1);
      }
    }

    // Kahn's algorithm for topological sorting
    const queue: string[] = [];
    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(id);
      }
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);

      for (const dependent of adj.get(current)!) {
        inDegree.set(dependent, inDegree.get(dependent)! - 1);
        if (inDegree.get(dependent) === 0) {
          queue.push(dependent);
        }
      }
    }

    if (order.length !== this.descriptors.size) {
      throw new Error('Cycle detected in runtime dependencies');
    }

    return order;
  }
}
