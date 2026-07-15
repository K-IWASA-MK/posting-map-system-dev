import { LearningDataset } from './LearningDataset';
import { LearningRecord } from './LearningRecord';
import { SourceType } from './SourceType';

export class LearningDatasetBuilder {
  public static build(
    records: LearningRecord[],
    sourceType: SourceType,
    sourceCount: number,
    version: number = 1
  ): LearningDataset {
    // Unique ID generation for dataset
    const datasetId = `DS-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    const metadata = Object.freeze({
      datasetId,
      recordCount: records.length,
      sourceCount,
      generatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
      datasetVersion: version
    });

    const frozenRecords = Object.freeze(records.map(r => Object.freeze({ ...r })));

    return Object.freeze({
      metadata,
      sourceType,
      records: frozenRecords
    });
  }
}
