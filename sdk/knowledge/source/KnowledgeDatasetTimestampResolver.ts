import { LearningPattern } from '../../learning/contracts';

export class KnowledgeDatasetTimestampResolver {
  public static resolve(patterns: ReadonlyArray<LearningPattern>): string {
    if (patterns.length === 0) {
      return '1970-01-01T00:00:00Z'; // fallback for empty dataset
    }
    const timestamps = patterns.map(p => new Date(p.createdAt).getTime());
    const maxTimestamp = Math.max(...timestamps);
    return new Date(maxTimestamp).toISOString();
  }
}
