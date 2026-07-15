import { LearningDatasetMetadata } from './LearningDatasetMetadata';
import { SourceType } from './SourceType';
import { LearningRecord } from './LearningRecord';

export interface LearningDataset {
  readonly metadata: LearningDatasetMetadata;
  readonly sourceType: SourceType;
  readonly records: readonly LearningRecord[];
}
