import { ExecutionDependencyGraph } from './ExecutionDependencyGraph';
import { TestAsset } from './TestAsset';

export class GraphScheduler {
  /**
   * Schedules test assets in topological order using Kahn's algorithm.
   * Resolves ties deterministically using TestAsset.priority (ascending) and ID (alphabetical).
   */
  public static schedule(graph: ExecutionDependencyGraph): TestAsset[] {
    const result: TestAsset[] = [];
    const allNodes = graph.getNodes();

    // 1. Calculate in-degrees for all nodes
    const inDegreeMap = new Map<string, number>();
    for (const node of allNodes) {
      inDegreeMap.set(node.id, graph.getParents(node.id).length);
    }

    // 2. Queue all roots (in-degree === 0)
    const queue: string[] = [];
    for (const node of allNodes) {
      if (inDegreeMap.get(node.id) === 0) {
        queue.push(node.id);
      }
    }

    // 3. Helper to sort the queue deterministically (priority -> alphabetical id)
    const sortQueue = (q: string[]) => {
      q.sort((a, b) => {
        const assetA = graph.getNode(a)!;
        const assetB = graph.getNode(b)!;
        const priorityA = assetA.priority ?? 100;
        const priorityB = assetB.priority ?? 100;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return a.localeCompare(b);
      });
    };

    sortQueue(queue);

    // 4. Process the queue
    while (queue.length > 0) {
      const currId = queue.shift()!;
      const currNode = graph.getNode(currId)!;
      result.push(currNode);

      // Decrement in-degree for all children depending on this node
      const children = graph.getChildren(currId);
      for (const childId of children) {
        const currentInDegree = inDegreeMap.get(childId) || 0;
        if (currentInDegree > 0) {
          const newInDegree = currentInDegree - 1;
          inDegreeMap.set(childId, newInDegree);
          if (newInDegree === 0) {
            queue.push(childId);
          }
        }
      }

      // Re-sort queue to maintain deterministic order
      sortQueue(queue);
    }

    // 5. Safety check for cycles
    if (result.length < allNodes.length) {
      throw new Error(`Circular dependency detected during topological scheduling. Only scheduled ${result.length} out of ${allNodes.length} nodes.`);
    }

    return result;
  }
}
