import { WorkflowNode, WorkflowEdge } from './WorkflowModels';

export class WorkflowGraph {
  public buildAdjacencyList(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): { adj: Map<string, string[]>; inDegree: Map<string, number> } {
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const n of nodes) {
      adj.set(n.nodeId, []);
      inDegree.set(n.nodeId, 0);
    }

    for (const e of edges) {
      // Validate that node endpoints exist in node set
      if (!adj.has(e.from) || !adj.has(e.to)) {
        throw new Error(`Edge references missing node: from [${e.from}] to [${e.to}]`);
      }

      adj.get(e.from)!.push(e.to);
      inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
    }

    return { adj, inDegree };
  }

  public getTopologicalOrder(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): string[] {
    const { adj, inDegree } = this.buildAdjacencyList(nodes, edges);
    const queue: string[] = [];

    for (const [nodeId, deg] of inDegree.entries()) {
      if (deg === 0) {
        queue.push(nodeId);
      }
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);

      const neighbors = adj.get(u) || [];
      for (const v of neighbors) {
        inDegree.set(v, inDegree.get(v)! - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      }
    }

    if (order.length !== nodes.length) {
      throw new Error('Graph cycle detected: Loop exists in dependency structure');
    }

    return order;
  }
}
