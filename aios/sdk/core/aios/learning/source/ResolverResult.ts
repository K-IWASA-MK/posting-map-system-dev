import { ILearningSource } from './ILearningSource';
import { LearningSourceCapability } from './LearningSourceCapability';

export interface ResolverResult {
  readonly source: ILearningSource;
  readonly capability: LearningSourceCapability;
  readonly reason: string;
}
