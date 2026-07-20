import { TestAsset } from './TestAsset';

export class ExecutionDependencyGraph {
  // parentId -> childIds (nodes that depend on the parent)
  private readonly adjacencyList = new Map<string, Set<string>>();
  // childId -> parentIds (nodes that the child depends on)
  private readonly incomingEdges = new Map<string, Set<string>>();
  private readonly nodes = new Map<string, TestAsset>();

  constructor(assets: TestAsset[]) {
    this.build(assets);
  }

  private build(assets: TestAsset[]): void {
    // 1. Initialize all nodes and adjacency maps
    for (const asset of assets) {
      this.nodes.set(asset.id, asset);
      this.adjacencyList.set(asset.id, new Set<string>());
      this.incomingEdges.set(asset.id, new Set<string>());
    }

    // 2. Add edges based on dependsOn relations
    for (const asset of assets) {
      if (asset.dependsOn && asset.dependsOn.length > 0) {
        for (const depId of asset.dependsOn) {
          // Add child relationship (depId is parent of asset.id)
          if (!this.adjacencyList.has(depId)) {
            this.adjacencyList.set(depId, new Set<string>());
          }
          this.adjacencyList.get(depId)!.add(asset.id);

          // Add parent relationship (asset.id has incoming edge from depId)
          this.incomingEdges.get(asset.id)!.add(depId);
        }
      }
    }
  }

  public getNode(nodeId: string): TestAsset | undefined {
    return this.nodes.get(nodeId);
  }

  public getNodes(): TestAsset[] {
    return Array.from(this.nodes.values());
  }

  public getChildren(nodeId: string): string[] {
    return Array.from(this.adjacencyList.get(nodeId) || []);
  }

  public getParents(nodeId: string): string[] {
    return Array.from(this.incomingEdges.get(nodeId) || []);
  }

  /**
   * Retrieves all transitive dependencies (all ancestors recursively) of a node.
   */
  public getTransitiveDependencies(nodeId: string): string[] {
    const visited = new Set<string>();
    const dfs = (currId: string) => {
      const parents = this.getParents(currId);
      for (const parent of parents) {
        if (!visited.has(parent)) {
          visited.add(parent);
          dfs(parent);
        }
      }
    };
    dfs(nodeId);
    return Array.from(visited);
  }

  /**
   * Returns nodes with no dependencies (in-degree = 0).
   */
  public getRoots(): string[] {
    const roots: string[] = [];
    for (const [id, parents] of this.incomingEdges.entries()) {
      if (parents.size === 0) {
        roots.push(id);
      }
    }
    return roots;
  }

  /**
   * Returns nodes that no other tests depend on (out-degree = 0).
   */
  public getLeaves(): string[] {
    const leaves: string[] = [];
    for (const [id, children] of this.adjacencyList.entries()) {
      if (children.size === 0 && this.nodes.has(id)) {
        leaves.push(id);
      }
    }
    return leaves;
  }
}
