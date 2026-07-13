export interface NotificationLedgerEntry {
    notificationId: string;
    correlationId?: string;
    workflowId?: string;
    runtimeId: string;
    provider: string;
    channel: string;
    template: string;
    status: string; // 'QUEUED', 'SENT', 'FAILED', 'DROPPED'
    retryCount: number;
    durationMs: number;
    payloadHash: string;
    timestamp: string;
}

export class NotificationLedger {
    private entries: NotificationLedgerEntry[] = [];

    public append(entry: NotificationLedgerEntry): void {
        this.entries.push(entry);
    }

    public getEntries(): NotificationLedgerEntry[] {
        return this.entries;
    }
}
