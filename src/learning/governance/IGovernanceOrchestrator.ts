import { LearningPattern } from '../contracts';
import { GovernanceResult } from './GovernanceResult';

export interface IGovernanceOrchestrator {
  evaluateAndStore(patterns: ReadonlyArray<LearningPattern>): Promise<GovernanceResult>;
}
