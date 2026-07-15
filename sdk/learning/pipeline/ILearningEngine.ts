import { LearningDataset, LearningPattern } from '../contracts';

export interface ILearningEngine {
  learn(dataset: LearningDataset): Promise<ReadonlyArray<LearningPattern>>;
}
