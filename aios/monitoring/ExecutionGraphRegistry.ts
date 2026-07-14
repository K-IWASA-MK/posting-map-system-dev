import { ExecutionGraphNode } from "./ExecutionGraphNode";
import { ExecutionGraphEdge } from "./ExecutionGraphEdge";

export class ExecutionGraphRegistry {
  private nodes: Map<string, ExecutionGraphNode> = new Map();
  private edges: ExecutionGraphEdge[] = [];

  public async addNode(node: ExecutionGraphNode): Promise<boolean> {
    if (this.nodes.has(node.id)) {
      return false;
    }
    this.nodes.set(node.id, node);
    return true;
  }

  public async addEdge(edge: ExecutionGraphEdge): Promise<boolean> {
    this.edges.push(edge);
    return true;
  }

  public async findNode(id: string): Promise<ExecutionGraphNode | null> {
    return this.nodes.get(id) || null;
  }

  public async removeNode(id: string): Promise<boolean> {
    const deleted = this.nodes.delete(id);
    if (deleted) {
      this.edges = this.edges.filter(edge => edge.from !== id && edge.to !== id);
    }
    return deleted;
  }

  public async listGraph(): Promise<{ nodes: ExecutionGraphNode[]; edges: ExecutionGraphEdge[] }> {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges
    };
  }
}
