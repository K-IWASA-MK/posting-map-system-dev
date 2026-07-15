import { MemoryObject } from '../MemoryObject';
import { MemoryState } from '../MemoryState';
import { MemoryRegistry } from '../MemoryRegistry';
import { MemoryPolicy } from '../MemoryPolicy';

export class MemoryRetentionService {
    constructor(
        private registry: MemoryRegistry,
        private policy: MemoryPolicy
    ) {}

    public processRetention(): void {
        const now = Date.now();
        const all = this.registry.getAll();

        for (const memory of all) {
            if (memory.expiresAt && now > new Date(memory.expiresAt).getTime()) {
                memory.state = MemoryState.EXPIRED;
                continue;
            }

            // Simple TTL logic for foundation mock
            const ageDays = (now - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            
            if (ageDays >= this.policy.retention.expireThresholdDays) {
                memory.state = MemoryState.EXPIRED;
            } else if (ageDays >= this.policy.retention.archiveThresholdDays && memory.state !== MemoryState.ARCHIVED) {
                memory.state = MemoryState.ARCHIVED;
            }
        }
    }
}
