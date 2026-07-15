/**
 * Represents a request to the Learning Engine to discover patterns.
 */
export interface LearningRequest {
  readonly schemaVersion: string;
  readonly requestId: string;
  readonly sourceType: string;
  readonly targetComponent?: string;
  readonly timeRange?: {
    readonly start: string;
    readonly end: string;
  };
  readonly filters: ReadonlyArray<string>;
}
