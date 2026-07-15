export interface LearningDatasetMetadata {
  readonly datasetId: string;
  readonly recordCount: number;
  readonly sourceCount: number;
  readonly generatedAt: string;
  readonly schemaVersion: string;
  readonly datasetVersion: number;
}
