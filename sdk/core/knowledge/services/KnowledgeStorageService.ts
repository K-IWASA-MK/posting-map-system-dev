import { KnowledgeObject } from '../KnowledgeObject';
import { KnowledgeRegistry } from '../KnowledgeRegistry';

export class KnowledgeStorageService {
    constructor(private registry: KnowledgeRegistry) {}

    public async store(knowledge: KnowledgeObject): Promise<void> {
        // Foundation: in-memory via registry. In future: VectorDB, DB etc.
        this.registry.register(knowledge);
    }

    public async retrieve(knowledgeId: string): Promise<KnowledgeObject | undefined> {
        return this.registry.get(knowledgeId);
    }
}
