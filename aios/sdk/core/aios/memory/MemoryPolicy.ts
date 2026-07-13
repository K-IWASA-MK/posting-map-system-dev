import { MemoryType } from './MemoryType';

export interface MemoryPolicy {
    retention: {
        ttlDays: number;
        maxReferences: number;
        maxSizeKb: number;
        compressionThresholdKb: number;
        archiveThresholdDays: number;
        expireThresholdDays: number;
    };
    resolverPriority: MemoryType[];
}
