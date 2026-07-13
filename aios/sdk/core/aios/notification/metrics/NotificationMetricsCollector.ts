export class NotificationMetricsCollector {
    private metrics = {
        notificationCount: 0,
        successCount: 0,
        failureCount: 0,
        retryCount: 0,
        totalDeliveryTimeMs: 0
    };

    public recordQueued(): void {
        this.metrics.notificationCount++;
    }

    public recordSuccess(deliveryTimeMs: number): void {
        this.metrics.successCount++;
        this.metrics.totalDeliveryTimeMs += deliveryTimeMs;
    }

    public recordFailure(): void {
        this.metrics.failureCount++;
    }

    public recordRetry(): void {
        this.metrics.retryCount++;
    }

    public getMetrics(queueLength: number): any {
        const successRate = this.metrics.notificationCount === 0 ? 0 : this.metrics.successCount / this.metrics.notificationCount;
        const avgDeliveryTime = this.metrics.successCount === 0 ? 0 : this.metrics.totalDeliveryTimeMs / this.metrics.successCount;

        return {
            ...this.metrics,
            successRate,
            avgDeliveryTime,
            queueLength
        };
    }
}
