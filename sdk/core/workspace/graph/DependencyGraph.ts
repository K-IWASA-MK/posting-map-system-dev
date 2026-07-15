export enum DependencyType {
  REQUIRES = 'REQUIRES',
  INCLUDES = 'INCLUDES',
  REFERENCES = 'REFERENCES'
}

export interface DependencyNode {
  id: string; // The ID of the repository, plugin, SDK, etc.
  type: 'WORKSPACE' | 'REPOSITORY' | 'PLUGIN' | 'SDK' | 'WORKER' | 'APPLICATION' | 'PACKAGE' | 'TEMPLATE';
  metadata?: any;
}

export interface DependencyEdge {
  sourceId: string;
  targetId: string;
  type: DependencyType;
  versionConstraint?: string; // e.g., '^1.0.0'
}

export class DependencyGraph {
  public nodes: Map<string, DependencyNode> = new Map();
  public edges: DependencyEdge[] = [];

  public addNode(node: DependencyNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(sourceId: string, targetId: string, type: DependencyType = DependencyType.REQUIRES, versionConstraint?: string): void {
    this.edges.push({ sourceId, targetId, type, versionConstraint });
  }

  public getDependencies(sourceId: string): DependencyEdge[] {
    return this.edges.filter(e => e.sourceId === sourceId);
  }

  public getDependents(targetId: string): DependencyEdge[] {
    return this.edges.filter(e => e.targetId === targetId);
  }
}
