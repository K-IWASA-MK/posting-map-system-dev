import { SourceType } from './SourceType';

export interface LearningRecord {
  readonly recordId: string;
  readonly sourceType: SourceType;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly timestamp: string;
}
