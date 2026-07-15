export interface NotificationTask {
    taskId: string;
    eventId: string;
    eventPayload: any;
    renderedPayload: string;
    channel: string;
    destination: string;
    providerName: string;
    retryCount: number;
    queuedAt: string;
}

export class NotificationQueue {
    private queue: NotificationTask[] = [];

    public enqueue(task: NotificationTask): void {
        this.queue.push(task);
    }

    public dequeue(): NotificationTask | undefined {
        return this.queue.shift();
    }

    public getLength(): number {
        return this.queue.length;
    }
}
