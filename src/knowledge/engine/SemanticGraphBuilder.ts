import { ISemanticNode, ISemanticEdge, KnowledgeSemantic } from '../contracts';
import { GraphValidator } from './GraphValidator';

export class SemanticGraphBuilder {
  private readonly nodes = new Map<string, ISemanticNode>();
  private readonly edges = new Map<string, ISemanticEdge>();

  public static create(): SemanticGraphBuilder {
    return new SemanticGraphBuilder();
  }

  public addNode(node: ISemanticNode): this {
    const existing = this.nodes.get(node.nodeId);
    if (existing) {
      this.nodes.set(node.nodeId, {
        ...existing,
        properties: { ...existing.properties, ...node.properties }
      });
    } else {
      this.nodes.set(node.nodeId, node);
    }
    return this;
  }

  public addEdge(edge: ISemanticEdge): this {
    this.edges.set(edge.edgeId, edge);
    return this;
  }

  public build(): KnowledgeSemantic {
    const nodesArray = Array.from(this.nodes.values());
    const edgesArray = Array.from(this.edges.values());

    GraphValidator.validate(nodesArray, edgesArray);

    return {
      nodes: Object.freeze(nodesArray.map(n => Object.freeze(n))),
      edges: Object.freeze(edgesArray.map(e => Object.freeze(e)))
    };
  }
}
