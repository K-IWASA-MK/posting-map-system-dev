import { AIOSEvent } from '../../event/AIOSEvent';

export class NotificationTemplateService {
    public render(event: AIOSEvent<any>, format: string = 'Markdown'): string {
        if (format === 'Markdown') {
            return this.renderMarkdown(event);
        }
        return JSON.stringify(event.payload);
    }

    private renderMarkdown(event: AIOSEvent<any>): string {
        return `**[${event.eventType}]**
* **Event ID**: ${event.eventId}
* **Runtime**: ${event.producerRuntimeId}
* **Time**: ${new Date(event.occurredAt).toLocaleString()}
\`\`\`json
${JSON.stringify(event.payload, null, 2)}
\`\`\``;
    }
}
