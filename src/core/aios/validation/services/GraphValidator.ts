export class GraphValidator {
  public validate(graph: any): boolean {
    const { nodes, adjList } = graph;
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const node of nodes) {
      if (this.hasCycle(node, adjList, visited, recursionStack)) {
        throw new Error(`Cycle detected in DAG starting at node ${node}`);
      }
    }
    return true;
  }

  private hasCycle(node: string, adjList: Map<string, string[]>, visited: Set<string>, recursionStack: Set<string>): boolean {
    if (recursionStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recursionStack.add(node);

    const neighbors = adjList.get(node) || [];
    for (const neighbor of neighbors) {
      if (this.hasCycle(neighbor, adjList, visited, recursionStack)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }
}
