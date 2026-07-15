import { IPatternData } from '../../contracts';

export interface SequencePatternData extends IPatternData {
  readonly type: 'SEQUENCE';
  /** Canonical ID representing the sequence, e.g., "SEQ:EVENT_A->EVENT_B" */
  readonly sequenceId: string;
  /** The ordered array of events, e.g., ["EVENT_A", "EVENT_B"] */
  readonly events: ReadonlyArray<string>;
  readonly length: number;
}
