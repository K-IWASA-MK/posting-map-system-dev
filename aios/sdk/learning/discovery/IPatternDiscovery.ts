import { LearningDataset } from '../contracts/LearningDataset';
import { PatternDiscoveryResult } from './PatternDiscoveryResult';

export interface IPatternDiscovery {
  discoverAll(dataset: LearningDataset): PatternDiscoveryResult;
}
