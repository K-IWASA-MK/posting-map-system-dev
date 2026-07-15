export enum GraphEdgeType {
    SUPPORTS = 'SUPPORTS',
    CONTRADICTS = 'CONTRADICTS',
    DERIVES = 'DERIVES',
    LEADS_TO = 'LEADS_TO'
}

export interface GraphEdge {
    sourceId: string;
    targetId: string;
    edgeType: GraphEdgeType;
}

export interface ReasoningGraph {
    graphId: string;
    nodes: Map<string, any>; // Hypothesis, Evidence, Inference, Decision
    edges: GraphEdge[];
}
