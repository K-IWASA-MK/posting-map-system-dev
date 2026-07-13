export interface KnowledgeReference {
    knowledgeId: string;
    source: string;
    contentSummary: string;
    relevanceScore: number;
}

export interface KnowledgeExtraction {
    contextId: string;
    extractedFacts: string[];
    confidence: number;
}

export interface KnowledgeContribution {
    knowledgeId: string;
    agentId: string;
    content: string;
    tags: string[];
    timestamp: string;
}

export interface IKnowledgeIntegration {
    searchKnowledge(query: string, tags?: string[]): Promise<KnowledgeReference[]>;
    extractKnowledge(context: any): Promise<KnowledgeExtraction>;
    contributeKnowledge(contribution: KnowledgeContribution): Promise<void>;
}
