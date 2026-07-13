import { KnowledgeObject } from './KnowledgeObject';

export class KnowledgeRegistry {
    private registry: Map<string, KnowledgeObject> = new Map();

    public register(knowledge: KnowledgeObject): void {
        this.registry.set(knowledge.knowledgeId, knowledge);
    }

    public get(knowledgeId: string): KnowledgeObject | undefined {
        return this.registry.get(knowledgeId);
    }

    public getAll(): KnowledgeObject[] {
        return Array.from(this.registry.values());
    }

    public update(knowledge: KnowledgeObject): void {
        if (!this.registry.has(knowledge.knowledgeId)) {
            throw new Error(`Knowledge ${knowledge.knowledgeId} not found in registry`);
        }
        this.registry.set(knowledge.knowledgeId, knowledge);
    }
}
