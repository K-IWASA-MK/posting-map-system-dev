export class ExecutionOrderGenerator {
  public generate(graph: any): string[] {
    const { nodes, adjList } = graph;
    const inDegree: Map<string, number> = new Map();
    
    nodes.forEach((n: string) => inDegree.set(n, 0));
    
    for (const [node, neighbors] of adjList.entries()) {
      for (const neighbor of neighbors as string[]) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(node);
      }
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);

      const neighbors = adjList.get(current) || [];
      for (const neighbor of neighbors as string[]) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (order.length !== nodes.length) {
      throw new Error("Cannot generate execution order due to cycle in DAG");
    }

    return order;
  }
}
