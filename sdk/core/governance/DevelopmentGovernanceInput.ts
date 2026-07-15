import { ValidationPipelineResult } from '../validation/ValidationPipelineResult';
import { ReviewResult } from '../reviewer/ReviewResult';
import { ExecutionSession } from '../engine/ExecutionSession';

export interface DevelopmentGovernanceInput {
  readonly validationResult: ValidationPipelineResult | null;
  readonly reviewResults: readonly ReviewResult[];
  readonly session: ExecutionSession;
}
