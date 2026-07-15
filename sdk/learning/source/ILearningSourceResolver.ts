import { LearningDataset, LearningRequest } from '../contracts';

export interface ILearningSourceResolver {
  resolve(request: LearningRequest): Promise<LearningDataset>;
}
