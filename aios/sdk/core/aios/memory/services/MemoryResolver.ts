import { MemoryObject } from '../MemoryObject';
import { MemoryRegistry } from '../MemoryRegistry';
import { MemoryPolicy } from '../MemoryPolicy';
import { MemoryScope } from '../MemoryScope';

export class MemoryResolver {
    constructor(
        private registry: MemoryRegistry,
        private policy: MemoryPolicy
    ) {}

    public resolve(query: string, scope: MemoryScope): MemoryObject[] {
        const results: MemoryObject[] = [];
        
        // Follow the configured resolver priority
        for (const type of this.policy.resolverPriority) {
            const candidates = this.registry.findByTypeAndScope(type, scope);
            // Simplistic filter for foundation
            const matched = candidates.filter(m => m.content.includes(query) || m.tags.includes(query));
            results.push(...matched);
        }
        
        // Sort by priority (CRITICAL > HIGH > NORMAL > LOW) mock
        return results;
    }
}
