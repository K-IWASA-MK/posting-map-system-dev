import { MemoryType } from './MemoryType';
import { MemoryState } from './MemoryState';
import { MemoryScope } from './MemoryScope';
import { MemoryPriority } from './MemoryPriority';
import { MemoryRelation } from './MemoryRelation';
import { MemoryVersion } from './MemoryVersion';

export interface MemoryObject {
    memoryId: string;
    correlationId?: string;
    sessionId?: string;
    ownerRuntimeId: string;
    createdBy: string;
    reason?: string;

    type: MemoryType;
    state: MemoryState;
    scope: MemoryScope;
    priority: MemoryPriority;

    content: string;
    tags: string[];
    relations: MemoryRelation[];
    version: MemoryVersion;

    accessedCount: number;
    lastAccessedAt?: string;
    createdAt: string;
    expiresAt?: string;
}
