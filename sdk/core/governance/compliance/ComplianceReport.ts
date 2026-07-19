import { ComplianceViolation, ComplianceResult } from '../GovernanceModels';

export interface ComplianceReport {
  readonly reportId: string;
  readonly overallScore: number;
  readonly results: ComplianceResult[];
  readonly timestamp: string;
}
