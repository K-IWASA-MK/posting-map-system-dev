import { AIOSEvent } from '../../event/AIOSEvent';
import { NotificationRegistry } from '../NotificationRegistry';
import { NotificationTemplateService } from './NotificationTemplateService';
import { NotificationQueue, NotificationTask } from './NotificationQueue';
import crypto from 'crypto';

export class NotificationRouter {
    constructor(
        private registry: NotificationRegistry,
        private templateService: NotificationTemplateService,
        private queue: NotificationQueue
    ) {}

    public route(event: AIOSEvent<any>): void {
        const rules = this.registry.getRulesForEvent(event.eventType);

        if (rules.length === 0) {
            return;
        }

        const renderedPayload = this.templateService.render(event, 'Markdown');

        for (const rule of rules) {
            for (const channel of rule.targetChannels) {
                const destinationConfig = this.registry.getDestination(channel);
                if (destinationConfig) {
                    const task: NotificationTask = {
                        taskId: crypto.randomUUID(),
                        eventId: event.eventId,
                        eventPayload: event.payload,
                        renderedPayload,
                        channel,
                        destination: destinationConfig.endpoint,
                        providerName: destinationConfig.providerName,
                        retryCount: 0,
                        queuedAt: new Date().toISOString()
                    };
                    this.queue.enqueue(task);
                }
            }
        }
    }
}
