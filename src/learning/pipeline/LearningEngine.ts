import { LearningDataset, LearningPattern, PatternStatus } from '../contracts';
import { IPatternDiscovery } from '../discovery';
import { ILearningEngine } from './ILearningEngine';

export class LearningEngine implements ILearningEngine {
  constructor(private readonly discovery: IPatternDiscovery) {}

  public async learn(dataset: LearningDataset): Promise<ReadonlyArray<LearningPattern>> {
    const discoveryResult = this.discovery.discoverAll(dataset);
    
    const patterns: LearningPattern[] = discoveryResult.patterns.map(item => {
      const patternId = `PAT-${item.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      return Object.freeze({
        schemaVersion: '1.0.0',
        patternId,
        version: 1,
        status: PatternStatus.DISCOVERED,
        createdAt: new Date().toISOString(),
        sourceDatasetIds: [dataset.datasetId],
        patternType: item.type,
        patternData: item.data,
        statistics: item.stats
      });
    });

    return Object.freeze(patterns);
  }
}
