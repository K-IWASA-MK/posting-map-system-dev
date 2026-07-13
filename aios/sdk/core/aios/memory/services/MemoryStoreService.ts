import { MemoryObject } from '../MemoryObject';
import { MemoryRegistry } from '../MemoryRegistry';

export class MemoryStoreService {
    constructor(private registry: MemoryRegistry) {}

    public async store(memory: MemoryObject): Promise<void> {
        this.registry.register(memory);
    }

    public async retrieve(memoryId: string): Promise<MemoryObject | undefined> {
        const memory = this.registry.get(memoryId);
        if (memory) {
            memory.accessedCount += 1;
            memory.lastAccessedAt = new Date().toISOString();
        }
        return memory;
    }
}
