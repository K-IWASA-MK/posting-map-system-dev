import { LearningPattern } from './LearningPattern';

export interface PatternGraphEdge {
    sourcePatternId: string;
    targetPatternId: string;
    relationshipType: 'LEADS_TO' | 'PREVENTS' | 'CORRELATES_WITH' | 'CAUSES';
    weight: number;
}

export interface PatternGraph {
    graphId: string;
    nodes: Map<string, LearningPattern>;
    edges: PatternGraphEdge[];
}
