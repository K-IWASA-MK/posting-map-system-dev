import { ICompressionProvider } from './ICompressionProvider';
import { MemoryObject } from '../../MemoryObject';

export class MockCompressionProvider implements ICompressionProvider {
    public readonly providerId = 'MockCompressionProvider';

    public canCompress(memory: MemoryObject): boolean {
        // Only compress if content is reasonably long
        return memory.content.length > 50;
    }

    public async compress(memory: MemoryObject): Promise<string> {
        // Foundation mock: just truncate string and add a summary note
        if (memory.content.length <= 50) {
            return memory.content;
        }
        return `[COMPRESSED] ${memory.content.substring(0, 40)}...`;
    }
}
