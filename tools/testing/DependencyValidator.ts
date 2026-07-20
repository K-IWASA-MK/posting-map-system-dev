import { ExecutionDependencyGraph } from './ExecutionDependencyGraph';

export interface DependencyValidationReport {
  isValid: boolean;
  errors: string[];
}

export class DependencyValidator {
  /**
   * Validates the dependency graph for self-dependencies, missing dependencies, and circular references.
   */
  public static validate(graph: ExecutionDependencyGraph): DependencyValidationReport {
    const errors: string[] = [];
    const assets = graph.getNodes();

    for (const asset of assets) {
      if (!asset.dependsOn) continue;

      for (const depId of asset.dependsOn) {
        // 1. Self Dependency Check
        if (depId === asset.id) {
          errors.push(`Self dependency detected on test ID "${asset.id}": A test cannot depend on itself.`);
        }

        // 2. Missing Dependency Check
        if (!graph.getNode(depId)) {
          errors.push(`Missing dependency for test ID "${asset.id}": Depends on non-existent test ID "${depId}".`);
        }
      }
    }

    // 3. Circular Dependency Check (DFS Cycle Detection with Path Output)
    const visited = new Set<string>();
    const recStack: string[] = [];

    const detectCycle = (nodeId: string): string[] | null => {
      visited.add(nodeId);
      recStack.push(nodeId);

      // We walk children or parents?
      // Since dependsOn points to parents, parent must execute before child.
      // So edge points Parent -> Child (adjacencyList).
      // Let's traverse down children. If we reach a child that is on our recursion stack, we found a path of dependencies that loops.
      const children = graph.getChildren(nodeId);
      for (const child of children) {
        const stackIndex = recStack.indexOf(child);
        if (stackIndex !== -1) {
          return [...recStack.slice(stackIndex), child];
        }
        if (!visited.has(child)) {
          const cycle = detectCycle(child);
          if (cycle) return cycle;
        }
      }

      recStack.pop();
      return null;
    };

    for (const asset of assets) {
      if (!visited.has(asset.id)) {
        const cycle = detectCycle(asset.id);
        if (cycle) {
          errors.push(`Circular dependency detected: ${cycle.join(' -> ')}`);
          break; // Stop at first detected loop to keep report clean
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
