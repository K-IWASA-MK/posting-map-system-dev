import { IRuntime } from '../runtime/IRuntime';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeHealth } from '../runtime/RuntimeHealth';
import { AIOSEventBus } from '../event/AIOSEventBus';
import { NotificationManifest } from './NotificationManifest';
import { NotificationPolicy } from './NotificationPolicy';
import { NotificationRegistry } from './NotificationRegistry';
import { NotificationRouter } from './services/NotificationRouter';
import { NotificationQueue, NotificationTask } from './services/NotificationQueue';
import { NotificationTemplateService } from './services/NotificationTemplateService';
import { NotificationLedger } from './ledger/NotificationLedger';
import { NotificationMetricsCollector } from './metrics/NotificationMetricsCollector';
import { NotificationStateMachine } from './state/NotificationStateMachine';
import { INotificationProvider } from './services/providers/INotificationProvider';
import { AIOSEvent } from '../event/AIOSEvent';
import crypto from 'crypto';

export class NotificationRuntime implements IRuntime<NotificationManifest, void> {
    public readonly descriptor: RuntimeDescriptor = {
        runtimeId: 'notification-runtime',
        runtimeName: 'Notification Runtime',
        version: 'v3.4.0-alpha.0',
        contractVersion: '1.0',
        capabilities: ['EVENT_DRIVEN_ROUTING' as any, 'NOTIFICATION_DELIVERY' as any],
        dependencies: []
    };

    private context?: RuntimeContext;
    private eventBus?: AIOSEventBus;
    
    private policy: NotificationPolicy;
    private registry: NotificationRegistry;
    private queue: NotificationQueue;
    private router: NotificationRouter;
    private templateService: NotificationTemplateService;
    private ledger: NotificationLedger;
    private metrics: NotificationMetricsCollector;
    private stateMachine: NotificationStateMachine;
    private providers: Map<string, INotificationProvider> = new Map();

    private workerInterval?: NodeJS.Timeout;
    private isRunning = false;

    // Rate limiting tracking
    private requestCount = 0;
    private windowStart = Date.now();

    constructor(policy: NotificationPolicy) {
        this.policy = policy;
        this.registry = new NotificationRegistry();
        this.queue = new NotificationQueue();
        this.templateService = new NotificationTemplateService();
        this.router = new NotificationRouter(this.registry, this.templateService, this.queue);
        this.ledger = new NotificationLedger();
        this.metrics = new NotificationMetricsCollector();
        this.stateMachine = new NotificationStateMachine();
    }

    public registerProvider(provider: INotificationProvider): void {
        this.providers.set(provider.name, provider);
    }

    public getRegistry(): NotificationRegistry {
        return this.registry;
    }

    public async getHealth(): Promise<RuntimeHealth> {
        return {
            status: (this.isRunning ? 'HEALTHY' : 'FAILED') as any,
            lastCheckedAt: new Date().toISOString(),
            details: {
                queueLength: this.queue.getLength(),
                metrics: this.metrics.getMetrics(this.queue.getLength())
            }
        };
    }

    public async initialize(context: RuntimeContext): Promise<void> {
        this.context = context;
        this.eventBus = (context as any).eventBus;

        // Subscribing to ALL events for routing
        if (this.eventBus) {
            this.eventBus.subscribe('*', this.handleEvent.bind(this));
        }

        this.startWorker();
    }

    private async handleEvent(event: AIOSEvent<any>): Promise<void> {
        if (event.producerRuntimeId === this.descriptor.runtimeId) return; // Prevent self-looping
        this.router.route(event);
        
        // Mark as queued conceptually
        if (this.queue.getLength() > 0) {
            this.metrics.recordQueued();
            this.publishInternalEvent('NotificationQueued', { eventId: event.eventId, queueLength: this.queue.getLength() });
        }
    }

    private startWorker(): void {
        this.isRunning = true;
        this.workerInterval = setInterval(() => this.processQueue(), 100);
    }

    private async processQueue(): Promise<void> {
        if (!this.isRunning) return;

        // Rate Limiting check
        const now = Date.now();
        if (now - this.windowStart > this.policy.rateLimit.windowMs) {
            this.windowStart = now;
            this.requestCount = 0;
        }

        if (this.requestCount >= this.policy.rateLimit.burst) {
            return; // Throttle
        }

        const task = this.queue.dequeue();
        if (!task) return;

        this.requestCount++;
        this.stateMachine.updateState(task.taskId, 'SENDING');
        this.publishInternalEvent('NotificationStarted', { taskId: task.taskId, provider: task.providerName });

        const provider = this.providers.get(task.providerName);
        const startTime = Date.now();

        try {
            if (!provider) throw new Error(`Provider ${task.providerName} not found`);

            const success = await provider.send(task.destination, task.renderedPayload);
            const duration = Date.now() - startTime;

            if (success) {
                this.stateMachine.updateState(task.taskId, 'DELIVERED');
                this.metrics.recordSuccess(duration);
                this.recordLedger(task, 'SUCCESS', duration);
                this.publishInternalEvent('NotificationSent', { taskId: task.taskId, duration });
            } else {
                throw new Error('Provider returned false');
            }
        } catch (error: any) {
            this.handleFailure(task, startTime, error.message);
        }
    }

    private handleFailure(task: NotificationTask, startTime: number, errorMessage: string): void {
        this.metrics.recordFailure();
        const duration = Date.now() - startTime;
        
        task.retryCount++;
        if (task.retryCount <= this.policy.retryCount) {
            this.stateMachine.updateState(task.taskId, 'QUEUED');
            this.metrics.recordRetry();
            this.publishInternalEvent('NotificationRetried', { taskId: task.taskId, retryCount: task.retryCount, error: errorMessage });
            
            // Re-queue
            setTimeout(() => {
                this.queue.enqueue(task);
            }, this.policy.retryIntervalMs * Math.pow(this.policy.backoffMultiplier, task.retryCount - 1));
        } else {
            this.stateMachine.updateState(task.taskId, 'FAILED');
            this.recordLedger(task, 'FAILED', duration);
            this.publishInternalEvent('NotificationFailed', { taskId: task.taskId, error: errorMessage });

            if (this.policy.failureStrategy === 'DROP') {
                this.publishInternalEvent('NotificationDropped', { taskId: task.taskId });
            }
            // If DLQ, would send to a DLQ service here
        }
    }

    private recordLedger(task: NotificationTask, status: string, durationMs: number): void {
        const payloadHash = crypto.createHash('sha256').update(task.renderedPayload).digest('hex');
        this.ledger.append({
            notificationId: task.taskId,
            runtimeId: this.descriptor.runtimeId,
            provider: task.providerName,
            channel: task.channel,
            template: 'Markdown',
            status,
            retryCount: task.retryCount,
            durationMs,
            payloadHash,
            timestamp: new Date().toISOString()
        });
    }

    private publishInternalEvent(eventType: string, payload: any): void {
        if (this.eventBus) {
            this.eventBus.publish({
                eventId: crypto.randomUUID(),
                eventType,
                eventVersion: '1.0',
                occurredAt: new Date().toISOString(),
                producerRuntimeId: this.descriptor.runtimeId,
                correlationId: payload.taskId || crypto.randomUUID(),
                causationId: payload.taskId || crypto.randomUUID(),
                payload
            });
        }
    }

    public async validate(manifest: NotificationManifest): Promise<void> {
        if (!manifest.capabilities.includes('NOTIFICATION_DELIVERY')) {
            throw new Error('Invalid manifest capabilities');
        }
    }

    public async execute(manifest: NotificationManifest): Promise<void> {
        // Validation implicitly done
    }

    public async pause(): Promise<void> {
        this.isRunning = false;
        if (this.workerInterval) clearInterval(this.workerInterval);
    }

    public async resume(): Promise<void> {
        if (!this.isRunning) {
            this.startWorker();
        }
    }

    public async shutdown(): Promise<void> {
        await this.pause();
        if (this.eventBus) {
            // Can't easily unsubscribe without storing handler ref, but typically context cleans up
        }
    }
}
