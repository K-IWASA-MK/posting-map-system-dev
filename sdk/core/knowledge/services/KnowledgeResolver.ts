import { KnowledgeCatalog } from '../KnowledgeCatalog';
import { KnowledgeObject } from '../KnowledgeObject';

export class KnowledgeResolver {
    constructor(private catalog: KnowledgeCatalog) {}

    public resolveForAgentContext(agentCapabilities: string[]): KnowledgeObject[] {
        const resolved: KnowledgeObject[] = [];
        for (const cap of agentCapabilities) {
            const items = this.catalog.findByCapability(cap);
            resolved.push(...items.filter(item => item.version.status === 'REUSABLE'));
        }
        return resolved;
    }
}
