/**
 * Represents a bounded dataset used for pattern extraction.
 * The structure will be finalized in S9-6 (Learning Pipeline).
 */
export interface LearningDataset {
  readonly datasetId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  // readonly events: ReadonlyArray<any>;
}
