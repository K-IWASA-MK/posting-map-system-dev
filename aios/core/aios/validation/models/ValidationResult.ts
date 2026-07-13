import { ValidationScore } from './ValidationScore';
import { ValidationStatus } from './ValidationEnums';

export interface ValidationResult {
  validationId: string;
  validatorId: string;
  validatorType: string;
  validatorVersion: string;
  policyVersion: string;
  
  score: ValidationScore;
  status: ValidationStatus;
  
  evidence: any; // Flexible format for foundation
  evidenceHash: string;
  artifacts: string[];
  
  startedAt: Date;
  completedAt: Date;
  duration: number;
  retryCount: number;
  
  traceId: string;
  executionId: string;
  governanceId: string;
  
  knowledgeCandidate: boolean;
}
