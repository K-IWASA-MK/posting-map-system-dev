/**
 * A minimal representation of an event/record within a LearningDataset.
 */
export interface LearningRecord {
  readonly eventId: string;
  readonly type: string; // The event action/name, e.g. "USER_TAP_BUTTON"
  readonly timestamp: string;
}

/**
 * Represents a bounded dataset used for pattern extraction.
 * The structure will be finalized in S9-6 (Learning Pipeline).
 */
export interface LearningDataset {
  readonly datasetId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  readonly records: ReadonlyArray<LearningRecord>;
}
