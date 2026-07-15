export enum KnowledgeRelationType {
    USES = 'USES',
    GENERATED_FROM = 'GENERATED_FROM',
    SUPERSEDES = 'SUPERSEDES',
    DEPENDS_ON = 'DEPENDS_ON',
    RELATED_TO = 'RELATED_TO',
    IMPLEMENTS = 'IMPLEMENTS',
    REFERENCES = 'REFERENCES'
}

export interface KnowledgeRelation {
    relationId: string;
    sourceKnowledgeId: string;
    targetKnowledgeId: string;
    relationType: KnowledgeRelationType;
    metadata?: Record<string, any>;
}
