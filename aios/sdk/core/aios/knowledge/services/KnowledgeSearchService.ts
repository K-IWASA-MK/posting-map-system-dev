import { KnowledgeObject } from '../KnowledgeObject';
import { KnowledgeCatalog } from '../KnowledgeCatalog';

export class KnowledgeSearchService {
    constructor(private catalog: KnowledgeCatalog) {}

    public async search(query: string): Promise<KnowledgeObject[]> {
        // Mock text search for Foundation
        return this.catalog.findByType('BEST_PRACTICE'); 
    }

    public async filterByTags(tags: string[]): Promise<KnowledgeObject[]> {
        return this.catalog.findByTags(tags);
    }
}
