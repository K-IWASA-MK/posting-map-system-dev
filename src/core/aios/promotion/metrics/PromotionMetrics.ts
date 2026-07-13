export class PromotionMetrics {
  private metrics = {
    totalPromotions: 0,
    successfulPromotions: 0,
    rejectedPromotions: 0,
    totalConflicts: 0,
    averageQualityScore: 0,
    knowledgeGrowthCount: 0
  };

  public recordPromotionAttempt(): void {
    this.metrics.totalPromotions++;
  }

  public recordPromotionSuccess(qualityScore: number): void {
    this.metrics.successfulPromotions++;
    this.metrics.knowledgeGrowthCount++;
    this.metrics.averageQualityScore = 
      ((this.metrics.averageQualityScore * (this.metrics.successfulPromotions - 1)) + qualityScore) / this.metrics.successfulPromotions;
  }

  public recordPromotionRejection(): void {
    this.metrics.rejectedPromotions++;
  }

  public recordConflict(): void {
    this.metrics.totalConflicts++;
  }

  public getSnapshot(): any {
    return {
      ...this.metrics,
      promotionRate: this.metrics.totalPromotions > 0 ? this.metrics.successfulPromotions / this.metrics.totalPromotions : 0,
      conflictRate: this.metrics.totalPromotions > 0 ? this.metrics.totalConflicts / this.metrics.totalPromotions : 0
    };
  }
}
