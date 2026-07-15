export class MemoryMetrics {
    private metrics = {
        memoryCount: 0,
        referenceCount: 0,
        cacheHitRate: 0,
        cacheAttempts: 0,
        cacheHits: 0,
        totalRetrievalTimeMs: 0,
        compressionCount: 0,
        expiredCount: 0,
        archiveCount: 0,
        workingMemoryUsage: 0,
        knowledgeCacheUsage: 0
    };

    public recordCreation(type: string): void {
        this.metrics.memoryCount++;
        if (type === 'WORKING_MEMORY') this.metrics.workingMemoryUsage++;
        if (type === 'KNOWLEDGE_CACHE') this.metrics.knowledgeCacheUsage++;
    }

    public recordReference(latencyMs: number, wasCacheHit: boolean): void {
        this.metrics.referenceCount++;
        this.metrics.totalRetrievalTimeMs += latencyMs;
        this.metrics.cacheAttempts++;
        if (wasCacheHit) {
            this.metrics.cacheHits++;
        }
    }

    public recordCompression(): void {
        this.metrics.compressionCount++;
    }

    public recordExpired(): void {
        this.metrics.expiredCount++;
    }

    public recordArchived(): void {
        this.metrics.archiveCount++;
    }

    public getMetrics(): any {
        return {
            ...this.metrics,
            cacheHitRate: this.metrics.cacheAttempts > 0 ? (this.metrics.cacheHits / this.metrics.cacheAttempts) : 0,
            averageRetrievalTime: this.metrics.referenceCount > 0 ? (this.metrics.totalRetrievalTimeMs / this.metrics.referenceCount) : 0,
            compressionRatio: this.metrics.memoryCount > 0 ? (this.metrics.compressionCount / this.metrics.memoryCount) : 0
        };
    }
}
