import { KnowledgeObject } from '../KnowledgeObject';

export interface IKnowledgeConsumer {
    name: string;
    consumeKnowledge(knowledge: KnowledgeObject): Promise<void>;
    notifyKnowledgeUpdated(knowledgeId: string): Promise<void>;
}
