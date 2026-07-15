import { LearningPattern, PatternType } from '../contracts';
import { PatternQueryRequest } from './PatternQueryRequest';
import { PatternQueryResult } from './PatternQueryResult';

export interface IPatternQueryService {
  query(request: PatternQueryRequest): Promise<PatternQueryResult>;
  findById(patternId: string): Promise<ReadonlyArray<LearningPattern>>;
  findByType(patternType: PatternType): Promise<ReadonlyArray<LearningPattern>>;
  findLatestVersion(patternId: string): Promise<LearningPattern | undefined>;
  findAll(): Promise<ReadonlyArray<LearningPattern>>;
}
