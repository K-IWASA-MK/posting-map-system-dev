import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeHealth } from '../runtime/RuntimeHealth';
import { AIOSEventBus } from '../event/AIOSEventBus';
import crypto from 'crypto';

import { MemoryManifest } from './MemoryManifest';
import { MemoryPolicy } from './MemoryPolicy';
import { MemoryObject } from './MemoryObject';
import { MemoryType } from './MemoryType';
import { MemoryState } from './MemoryState';
import { MemoryScope } from './MemoryScope';
import { MemoryPriority } from './MemoryPriority';

import { MemoryStoreService } from './services/MemoryStoreService';
import { MemorySearchService } from './services/MemorySearchService';
import { MemoryCompressionService } from './services/MemoryCompressionService';
import { MemoryMergeService } from './services/MemoryMergeService';
import { MemoryResolver } from './services/MemoryResolver';
import { MemoryRetentionService } from './services/MemoryRetentionService';

import { MemoryStateMachine } from './state/MemoryStateMachine';
import { MemoryLedger } from './ledger/MemoryLedger';
import { MemoryMetrics } from './metrics/MemoryMetrics';
import { MemoryObservability } from './observability/MemoryObservability';

export class MemoryRuntime implements IRuntime<MemoryManifest, void> {
    public readonly descriptor: RuntimeDescriptor = {
        runtimeId: 'memory-runtime',
        runtimeName: 'Memory Runtime',
        version: 'v3.7.0-alpha.0',
        contractVersion: '1.0',
        capabilities: [
            'CAN_STORE_MEMORY' as any,
            'CAN_QUERY_MEMORY' as any,
            'CAN_REFERENCE_MEMORY' as any,
            'CAN_COMPRESS_MEMORY' as any,
            'CAN_EXPIRE_MEMORY' as any,
            'CAN_LINK_MEMORY' as any,
            'CAN_SUMMARIZE_MEMORY' as any
        ],
        dependencies: []
    };

    private context?: RuntimeContext;
    private eventBus?: AIOSEventBus;

    constructor(
        private policy: MemoryPolicy,
        private storeService: MemoryStoreService,
        private searchService: MemorySearchService,
        private compressionService: MemoryCompressionService,
        private mergeService: MemoryMergeService,
        private resolver: MemoryResolver,
        private retentionService: MemoryRetentionService,
        private stateMachine: MemoryStateMachine,
        private ledger: MemoryLedger,
        private metrics: MemoryMetrics,
        private observability: MemoryObservability
    ) {}

    public async initialize(context: RuntimeContext): Promise<void> {
        this.context = context;
        this.eventBus = (context as any).eventBus;
    }

    public async execute(manifest: MemoryManifest): Promise<void> {
        // Core background operations: Retention and Compression
        this.retentionService.processRetention();
        // Fire Retention event
        this.publishEvent('MemoryRetentionExecuted', { timestamp: new Date().toISOString() });
    }

    public async storeMemory(
        type: MemoryType,
        scope: MemoryScope,
        priority: MemoryPriority,
        content: string,
        tags: string[],
        ownerRuntimeId: string,
        createdBy: string,
        correlationId?: string,
        sessionId?: string,
        reason?: string
    ): Promise<MemoryObject> {
        const memoryId = crypto.randomUUID();
        const obj: MemoryObject = {
            memoryId,
            type,
            scope,
            priority,
            content,
            tags,
            ownerRuntimeId,
            createdBy,
            correlationId,
            sessionId,
            reason,
            state: MemoryState.CREATED,
            relations: [],
            version: {
                revision: 1,
                updatedAt: new Date().toISOString()
            },
            accessedCount: 0,
            createdAt: new Date().toISOString()
        };

        await this.storeService.store(obj);
        this.metrics.recordCreation(type);
        this.ledger.append({
            entryId: crypto.randomUUID(),
            memoryId,
            action: 'CREATED',
            timestamp: new Date().toISOString()
        });

        this.publishEvent('MemoryStored', { memoryId, type, scope });

        // Auto-activate
        this.stateMachine.transition(obj, MemoryState.ACTIVE);
        obj.state = MemoryState.ACTIVE;
        obj.version.revision += 1;
        obj.version.updatedAt = new Date().toISOString();

        return obj;
    }

    public async searchMemory(query: string, scope?: MemoryScope): Promise<MemoryObject[]> {
        this.publishEvent('MemorySearchStarted', { query, scope });
        const startTime = Date.now();
        const results = await this.searchService.search(query, scope);
        const latency = Date.now() - startTime;
        
        for (const res of results) {
            this.stateMachine.transition(res, MemoryState.REFERENCED);
            res.state = MemoryState.REFERENCED;
            res.version.revision += 1;
            res.version.updatedAt = new Date().toISOString();
        }

        this.publishEvent('MemorySearchCompleted', { query, resultCount: results.length, latencyMs: latency });
        return results;
    }

    public async resolveMemory(query: string, scope: MemoryScope): Promise<MemoryObject[]> {
        const startTime = Date.now();
        const results = this.resolver.resolve(query, scope);
        
        // Assume resolver acts as cache reference
        const latency = Date.now() - startTime;
        this.metrics.recordReference(latency, results.length > 0);

        this.publishEvent('MemoryResolved', { query, scope, resultCount: results.length });
        return results;
    }

    public async compressMemory(memoryId: string): Promise<boolean> {
        const memory = await this.storeService.retrieve(memoryId);
        if (!memory) return false;

        this.publishEvent('MemoryCompactionStarted', { memoryId });
        const result = await this.compressionService.compress(memory);
        if (result) {
            this.metrics.recordCompression();
            this.ledger.append({
                entryId: crypto.randomUUID(),
                memoryId,
                action: 'COMPRESSED',
                timestamp: new Date().toISOString()
            });
            this.publishEvent('MemoryCompactionCompleted', { memoryId, status: 'SUCCESS' });
        }
        return result;
    }

    private publishEvent(eventType: string, payload: any): void {
        if (this.eventBus) {
            this.eventBus.publish({
                eventId: crypto.randomUUID(),
                eventType,
                eventVersion: '1.0',
                occurredAt: new Date().toISOString(),
                producerRuntimeId: this.descriptor.runtimeId,
                correlationId: crypto.randomUUID(),
                causationId: crypto.randomUUID(),
                payload
            });
        }
    }

    public async getHealth(): Promise<RuntimeHealth> {
        const isHealthy = this.observability.checkHealth();
        return {
            status: (isHealthy ? 'HEALTHY' : 'DEGRADED') as any,
            lastCheckedAt: new Date().toISOString(),
            details: this.observability.getStatusReport()
        };
    }

    public async pause(): Promise<void> {}
    public async resume(): Promise<void> {}
    public async shutdown(): Promise<void> {}
    
    public async validate(manifest: MemoryManifest): Promise<void> {}
}
