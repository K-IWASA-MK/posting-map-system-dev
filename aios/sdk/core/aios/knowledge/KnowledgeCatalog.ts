import { KnowledgeObject } from './KnowledgeObject';
import { KnowledgeRegistry } from './KnowledgeRegistry';

export class KnowledgeCatalog {
    constructor(private registry: KnowledgeRegistry) {}

    public findByTags(tags: string[]): KnowledgeObject[] {
        return this.registry.getAll().filter(k => 
            tags.some(tag => k.tags.includes(tag))
        );
    }

    public findByCapability(capability: string): KnowledgeObject[] {
        return this.registry.getAll().filter(k => 
            k.capabilities.includes(capability)
        );
    }

    public findByRuntime(runtime: string): KnowledgeObject[] {
        return this.registry.getAll().filter(k => 
            k.runtimes.includes(runtime)
        );
    }

    public findByType(type: string): KnowledgeObject[] {
        return this.registry.getAll().filter(k => 
            k.type === type
        );
    }
    
    // Future expansion: Text search indexing, semantic search vectors, etc.
}
