import { LearningPattern } from '../contracts';
import { GovernanceDecision } from './GovernanceDecision';

export interface GovernanceResult {
  readonly approvedPatterns: ReadonlyArray<LearningPattern>;
  readonly rejectedPatterns: ReadonlyArray<LearningPattern>;
  readonly decisions: ReadonlyArray<GovernanceDecision>;
  readonly durationMs: number;
}
