import { SourceType } from './SourceType';

export interface LearningRequest {
  readonly requestId: string;
  readonly sourceType: SourceType;
  readonly executionId?: string;
  readonly correlationId?: string;
  readonly timeRange?: { readonly start: string; readonly end: string };
  readonly filters: Readonly<Record<string, unknown>>;
  readonly schemaVersion: string;
}
