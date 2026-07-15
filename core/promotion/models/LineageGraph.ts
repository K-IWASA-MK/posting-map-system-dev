export interface LineageNode {
  nodeId: string;
  knowledgeId: string;
  version: string;
  fingerprint: string;
  domain: string;
  createdAt: Date;
}

export interface LineageEdge {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  relationshipType: 'DERIVED_FROM' | 'MERGED_INTO' | 'REPLACES';
  createdAt: Date;
}

export interface LineageGraph {
  graphId: string;
  nodes: LineageNode[];
  edges: LineageEdge[];
  updatedAt: Date;
}
