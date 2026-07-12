import { LearningRequest } from './LearningRequest';
import { LearningDataset } from './LearningDataset';
import { LearningSourceCapability } from './LearningSourceCapability';

export interface ILearningSource {
  supports(request: LearningRequest): boolean;
  load(request: LearningRequest): Promise<LearningDataset>;
  capability(): LearningSourceCapability;
  priority(): number; // Priority mapping for Composite ordering (higher = run earlier)
}
