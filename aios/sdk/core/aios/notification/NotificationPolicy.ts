export interface NotificationPolicy {
    // Retry Strategy
    retryCount: number;
    retryIntervalMs: number;
    backoffMultiplier: number;
    maxRetry: number;
    failureStrategy: 'DROP' | 'RETRY' | 'DLQ';

    // Rate Limiting
    rateLimit: {
        windowMs: number;
        burst: number;
        coolDownMs: number;
    };
}
