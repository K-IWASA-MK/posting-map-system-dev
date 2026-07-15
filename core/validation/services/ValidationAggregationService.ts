import { ValidationResult } from '../models/ValidationResult';
import { ValidationScore } from '../models/ValidationScore';
import { ValidationSeverity, ValidationStatus } from '../models/ValidationEnums';

export class ValidationAggregationService {
  public aggregate(results: ValidationResult[]): { status: ValidationStatus, aggregatedScore: number, aggregatedSeverity: ValidationSeverity, overallConfidence: number } {
    let totalScore = 0;
    let totalConfidence = 0;
    let maxSeverity = ValidationSeverity.PASS;
    
    const severityValues = {
      [ValidationSeverity.PASS]: 0,
      [ValidationSeverity.WARNING]: 1,
      [ValidationSeverity.MINOR]: 2,
      [ValidationSeverity.MAJOR]: 3,
      [ValidationSeverity.CRITICAL]: 4
    };

    for (const res of results) {
      totalScore += res.score.score;
      totalConfidence += res.score.confidence;
      if (severityValues[res.score.severity] > severityValues[maxSeverity]) {
        maxSeverity = res.score.severity;
      }
    }

    const avgScore = results.length > 0 ? totalScore / results.length : 0;
    const avgConfidence = results.length > 0 ? totalConfidence / results.length : 0;
    
    let status = ValidationStatus.VERIFIED;
    if (maxSeverity === ValidationSeverity.CRITICAL || maxSeverity === ValidationSeverity.MAJOR) {
      status = ValidationStatus.FAILED;
    }

    return {
      status,
      aggregatedScore: avgScore,
      aggregatedSeverity: maxSeverity,
      overallConfidence: avgConfidence
    };
  }
}
