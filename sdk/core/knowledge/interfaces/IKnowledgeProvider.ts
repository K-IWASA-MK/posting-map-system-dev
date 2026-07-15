import { KnowledgeObject } from '../KnowledgeObject';

export interface IKnowledgeProvider {
    name: string;
    provideKnowledge(query: string): Promise<KnowledgeObject[]>;
    storeKnowledge(knowledge: KnowledgeObject): Promise<void>;
}
