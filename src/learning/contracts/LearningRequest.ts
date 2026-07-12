/**
 * Represents a request to the Learning Engine to discover patterns.
 */
export interface LearningRequest {
  readonly schemaVersion: string;
  readonly sourceType: string;
  readonly targetComponent?: string;
  readonly timeRange?: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly filters: ReadonlyArray<string>;
}
