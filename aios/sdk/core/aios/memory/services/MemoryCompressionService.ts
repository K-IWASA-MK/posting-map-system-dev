import { MemoryObject } from '../MemoryObject';
import { MemoryState } from '../MemoryState';
import { ICompressionProvider } from './providers/ICompressionProvider';

export class MemoryCompressionService {
    constructor(private provider: ICompressionProvider) {}

    public async compress(memory: MemoryObject): Promise<boolean> {
        if (!this.provider.canCompress(memory)) {
            return false;
        }

        const compressedContent = await this.provider.compress(memory);
        memory.content = compressedContent;
        memory.state = MemoryState.COMPRESSED;
        memory.version.compressedRevision = memory.version.revision + 1;
        memory.version.revision += 1;
        memory.version.updatedAt = new Date().toISOString();
        return true;
    }
}
