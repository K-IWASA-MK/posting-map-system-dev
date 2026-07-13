import { MemoryObject } from '../MemoryObject';
import { MemoryRegistry } from '../MemoryRegistry';
import { MemoryType } from '../MemoryType';
import { MemoryScope } from '../MemoryScope';

export class MemorySearchService {
    constructor(private registry: MemoryRegistry) {}

    public async search(query: string, scope?: MemoryScope): Promise<MemoryObject[]> {
        // Foundation Mock Text Search
        let results = this.registry.getAll();
        
        if (scope) {
            results = results.filter(m => m.scope === scope);
        }

        // Extremely simple keyword match for foundation
        return results.filter(m => m.content.includes(query) || m.tags.includes(query));
    }
}
