import { MemoryObject } from '../MemoryObject';
import { MemoryRelationType } from '../MemoryRelation';

export class MemoryMergeService {
    public async merge(sourceId: string, target: MemoryObject): Promise<void> {
        // Mock foundation merge logic
        target.relations.push({
            targetMemoryId: sourceId,
            relationType: MemoryRelationType.MERGED_WITH,
            createdAt: new Date().toISOString()
        });
        target.version.revision += 1;
        target.version.updatedAt = new Date().toISOString();
    }
}
