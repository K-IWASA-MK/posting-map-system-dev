import { MemoryObject } from './MemoryObject';
import { MemoryType } from './MemoryType';
import { MemoryScope } from './MemoryScope';

export class MemoryRegistry {
    private memories: Map<string, MemoryObject> = new Map();

    public register(memory: MemoryObject): void {
        this.memories.set(memory.memoryId, memory);
    }

    public unregister(memoryId: string): void {
        this.memories.delete(memoryId);
    }

    public get(memoryId: string): MemoryObject | undefined {
        return this.memories.get(memoryId);
    }

    public getAll(): MemoryObject[] {
        return Array.from(this.memories.values());
    }

    public findByTypeAndScope(type: MemoryType, scope: MemoryScope): MemoryObject[] {
        return this.getAll().filter(m => m.type === type && m.scope === scope);
    }

    public findByTags(tags: string[]): MemoryObject[] {
        return this.getAll().filter(m => tags.some(tag => m.tags.includes(tag)));
    }
}
