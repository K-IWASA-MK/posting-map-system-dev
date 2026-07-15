import { IPatternExtractor } from '../../discovery';
import { LearningDataset } from '../../contracts';
import { SequencePatternData } from './SequencePatternData';
import { SequencePatternStatistics } from './SequencePatternStatistics';

export class SequencePatternExtractor implements IPatternExtractor<SequencePatternData, SequencePatternStatistics> {
  
  public supports(dataset: LearningDataset): boolean {
    return dataset.records !== undefined && dataset.records.length >= 2;
  }

  public extract(dataset: LearningDataset): ReadonlyArray<{ data: SequencePatternData, stats: SequencePatternStatistics }> {
    if (!this.supports(dataset)) {
      return [];
    }

    const records = dataset.records;
    const pairCounts = new Map<string, number>();
    const pairEvents = new Map<string, ReadonlyArray<string>>();

    // 2-gram extraction: strictly order-preserving
    for (let i = 0; i < records.length - 1; i++) {
      const eventA = records[i].type;
      const eventB = records[i + 1].type;
      
      const sequenceId = `SEQ:${eventA}->${eventB}`; // Canonical ID

      const currentCount = pairCounts.get(sequenceId) || 0;
      pairCounts.set(sequenceId, currentCount + 1);

      if (!pairEvents.has(sequenceId)) {
        pairEvents.set(sequenceId, Object.freeze([eventA, eventB]));
      }
    }

    const sampleCount = records.length - 1; // Total possible 2-grams

    const results: { data: SequencePatternData, stats: SequencePatternStatistics }[] = [];

    pairCounts.forEach((occurrenceCount, sequenceId) => {
      results.push({
        data: Object.freeze({
          type: 'SEQUENCE',
          sequenceId,
          events: pairEvents.get(sequenceId)!,
          length: 2
        }),
        stats: Object.freeze({
          sampleCount,
          occurrenceCount
        })
      });
    });

    return Object.freeze(results);
  }
}
