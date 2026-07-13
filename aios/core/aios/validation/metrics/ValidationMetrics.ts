export class ValidationMetrics {
  public averageValidationScore: number = 0;
  public averageConfidence: number = 0;
  public pipelineDuration: number = 0;
  public validatorUtilization: number = 0;
  public validationThroughput: number = 0;
  public graphComplexity: number = 0;
  public retrySuccessRate: number = 0;
  public warningRate: number = 0;

  public recordScore(score: number, confidence: number) {
    this.averageValidationScore = (this.averageValidationScore + score) / 2;
    this.averageConfidence = (this.averageConfidence + confidence) / 2;
  }
  
  public recordDuration(durationMs: number) {
    this.pipelineDuration = durationMs;
  }
}
