export enum MemoryRelationType {
    REFERENCES = 'REFERENCES',
    DERIVED_FROM = 'DERIVED_FROM',
    SUMMARIZES = 'SUMMARIZES',
    MERGED_WITH = 'MERGED_WITH',
    RELATED_TO = 'RELATED_TO',
    USED_BY = 'USED_BY'
}

export interface MemoryRelation {
    targetMemoryId: string;
    relationType: MemoryRelationType;
    createdAt: string;
}
