import { ValidationResult } from '../models/ValidationResult';

export class ValidationEvidenceService {
  public collect(results: ValidationResult[]): any[] {
    // Collect and format all evidences from the validators
    return results.map(r => ({
      validatorId: r.validatorId,
      score: r.score,
      evidence: r.evidence,
      hash: r.evidenceHash
    }));
  }
}
