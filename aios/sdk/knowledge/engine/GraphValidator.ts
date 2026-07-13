import { ISemanticNode, ISemanticEdge } from '../contracts';

export class GraphValidator {
  public static validate(nodes: ReadonlyArray<ISemanticNode>, edges: ReadonlyArray<ISemanticEdge>): void {
    const nodeIds = new Set(nodes.map(n => n.nodeId));

    if (nodeIds.size !== nodes.length) {
      throw new Error("Duplicate nodeId detected in nodes list");
    }

    const adjacency = new Map<string, string[]>();
    nodeIds.forEach(id => adjacency.set(id, []));

    for (const edge of edges) {
      if (!nodeIds.has(edge.sourceNodeId)) {
        throw new Error(`Edge sourceNodeId ${edge.sourceNodeId} does not exist in nodes`);
      }
      if (!nodeIds.has(edge.targetNodeId)) {
        throw new Error(`Edge targetNodeId ${edge.targetNodeId} does not exist in nodes`);
      }
      if (edge.sourceNodeId === edge.targetNodeId) {
        throw new Error(`Self-loop detected: ${edge.sourceNodeId}`);
      }
      adjacency.get(edge.sourceNodeId)!.push(edge.targetNodeId);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adjacency.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of Array.from(nodeIds)) {
      if (dfs(nodeId)) {
        throw new Error("Cycle detected in Semantic Graph. MUST represent a Directed Acyclic Graph (DAG).");
      }
    }
  }
}
