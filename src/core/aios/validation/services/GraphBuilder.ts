export class GraphBuilder {
  public build(nodes: string[], edges: {from: string, to: string}[]): any {
    // Represents DAG as adjacency list
    const adjList: Map<string, string[]> = new Map();
    nodes.forEach(node => adjList.set(node, []));
    
    edges.forEach(edge => {
      if (!adjList.has(edge.from) || !adjList.has(edge.to)) {
        throw new Error(`Invalid edge: ${edge.from} -> ${edge.to}`);
      }
      adjList.get(edge.from)!.push(edge.to);
    });

    return {
      nodes,
      edges,
      adjList
    };
  }
}
