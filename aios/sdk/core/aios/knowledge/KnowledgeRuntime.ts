import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeHealth } from '../runtime/RuntimeHealth';
import { AIOSEventBus } from '../event/AIOSEventBus';
import crypto from 'crypto';

import { KnowledgeManifest } from './KnowledgeManifest';
import { KnowledgePolicy } from './KnowledgePolicy';
import { KnowledgeObject } from './KnowledgeObject';
import { KnowledgeType } from './KnowledgeType';
import { KnowledgeSource } from './KnowledgeSource';

import { KnowledgeStorageService } from './services/KnowledgeStorageService';
import { KnowledgeSearchService } from './services/KnowledgeSearchService';
import { KnowledgeEvolutionService } from './services/KnowledgeEvolutionService';
import { KnowledgeValidationService } from './services/KnowledgeValidationService';
import { PromotionService } from './services/PromotionService';

import { KnowledgeLedger } from './ledger/KnowledgeLedger';
import { KnowledgeMetrics } from './metrics/KnowledgeMetrics';
import { KnowledgeObservability } from './observability/KnowledgeObservability';

export class KnowledgeRuntime implements IRuntime<KnowledgeManifest, void> {
    public readonly descriptor: RuntimeDescriptor = {
        runtimeId: 'knowledge-runtime',
        runtimeName: 'Knowledge Runtime',
        version: 'v3.6.0-alpha.0',
        contractVersion: '1.0',
        capabilities: [
            'CAN_STORE_KNOWLEDGE' as any,
            'CAN_SEARCH_KNOWLEDGE' as any,
            'CAN_EVOLVE_KNOWLEDGE' as any,
            'CAN_LINK_KNOWLEDGE' as any,
            'CAN_VALIDATE_KNOWLEDGE' as any,
            'CAN_PROMOTE_PATTERN' as any,
            'CAN_DEPRECATE_KNOWLEDGE' as any
        ],
        dependencies: []
    };

    private context?: RuntimeContext;
    private eventBus?: AIOSEventBus;
    
    constructor(
        private policy: KnowledgePolicy,
        private storageService: KnowledgeStorageService,
        private searchService: KnowledgeSearchService,
        private evolutionService: KnowledgeEvolutionService,
        private validationService: KnowledgeValidationService,
        private promotionService: PromotionService,
        private ledger: KnowledgeLedger,
        private metrics: KnowledgeMetrics,
        private observability: KnowledgeObservability
    ) {}

    public async initialize(context: RuntimeContext): Promise<void> {
        this.context = context;
        this.eventBus = (context as any).eventBus;
        // KnowledgeRuntimeStarted
    }

    public async execute(manifest: KnowledgeManifest): Promise<void> {
        // generic execution
    }

    public async storeKnowledge(
        type: KnowledgeType,
        source: KnowledgeSource,
        title: string,
        content: string,
        tags: string[],
        capabilities: string[],
        runtimes: string[]
    ): Promise<KnowledgeObject> {
        const knowledgeId = crypto.randomUUID();
        const obj: KnowledgeObject = {
            knowledgeId,
            type,
            source,
            title,
            content,
            tags,
            capabilities,
            runtimes,
            version: {
                major: 1,
                minor: 0,
                patch: 0,
                status: 'DRAFT',
                revision: 1,
                timestamp: new Date().toISOString()
            },
            validations: [],
            hash: crypto.createHash('sha256').update(content).digest('hex'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await this.storageService.store(obj);
        this.metrics.recordCreation();
        this.ledger.append({
            entryId: crypto.randomUUID(),
            knowledgeId,
            action: 'CREATED',
            timestamp: new Date().toISOString()
        });

        this.publishEvent('KnowledgeCreated', { knowledgeId, type, source });

        // Auto-validate and promote if possible
        await this.validateAndPromote(obj);

        return obj;
    }

    private async validateAndPromote(obj: KnowledgeObject): Promise<void> {
        const validation = await this.validationService.validate(obj);
        this.metrics.recordValidation(validation.score >= 0.8);
        this.ledger.append({
            entryId: crypto.randomUUID(),
            knowledgeId: obj.knowledgeId,
            action: 'VALIDATED',
            timestamp: new Date().toISOString(),
            metadata: { score: validation.score }
        });
        this.publishEvent('KnowledgeValidated', { knowledgeId: obj.knowledgeId, score: validation.score });

        // Evaluate Promotion
        const promoted = await this.promotionService.evaluatePromotion(obj);
        if (promoted) {
            this.metrics.recordPromotion();
            this.ledger.append({
                entryId: crypto.randomUUID(),
                knowledgeId: obj.knowledgeId,
                action: 'PROMOTED',
                timestamp: new Date().toISOString(),
                metadata: { newStatus: obj.version.status }
            });
            this.publishEvent('KnowledgePromoted', { knowledgeId: obj.knowledgeId, newStatus: obj.version.status });

            if (obj.version.status === 'REUSABLE') {
                this.metrics.recordReusable();
            } else if (obj.version.status === 'APPROVED') {
                this.publishEvent('KnowledgeApproved', { knowledgeId: obj.knowledgeId });
            }
        }
    }

    public async searchKnowledge(query: string): Promise<KnowledgeObject[]> {
        const startTime = Date.now();
        const results = await this.searchService.search(query);
        this.metrics.recordSearch(Date.now() - startTime);
        return results;
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
    
    public async validate(manifest: KnowledgeManifest): Promise<void> {}
}
