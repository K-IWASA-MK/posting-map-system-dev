import { LearningPattern, PatternType } from '../contracts';
import { IPatternRepository } from '../repository/IPatternRepository';
import { IPatternQueryService } from './IPatternQueryService';
import { PatternQueryRequest } from './PatternQueryRequest';
import { PatternQueryResult } from './PatternQueryResult';
import { PatternQueryValidator } from './PatternQueryValidator';

export class PatternQueryService implements IPatternQueryService {
  constructor(private readonly repository: IPatternRepository) {}

  public async query(request: PatternQueryRequest): Promise<PatternQueryResult> {
    PatternQueryValidator.validate(request);

    let allPatterns = await this.repository.findAll();

    // 1. Filter
    if (request.patternId) {
      allPatterns = allPatterns.filter(p => p.patternId === request.patternId);
    }
    if (request.patternType) {
      allPatterns = allPatterns.filter(p => p.patternType === request.patternType);
    }
    if (request.version !== undefined) {
      allPatterns = allPatterns.filter(p => p.version === request.version);
    }
    if (request.trustLevel) {
      allPatterns = allPatterns.filter(p => p.evaluation && p.evaluation.trustLevel === request.trustLevel);
    }
    if (request.sourceDatasetId) {
      allPatterns = allPatterns.filter(p => p.sourceDatasetIds.includes(request.sourceDatasetId!));
    }
    if (request.createdAfter) {
      const after = new Date(request.createdAfter).getTime();
      allPatterns = allPatterns.filter(p => new Date(p.createdAt).getTime() >= after);
    }
    if (request.createdBefore) {
      const before = new Date(request.createdBefore).getTime();
      allPatterns = allPatterns.filter(p => new Date(p.createdAt).getTime() <= before);
    }

    const totalCount = allPatterns.length;

    // 2. Pagination
    let patterns = allPatterns;
    const offset = request.offset || 0;
    const limit = request.limit;

    if (offset > 0 || limit !== undefined) {
      const end = limit !== undefined ? offset + limit : undefined;
      patterns = patterns.slice(offset, end);
    }

    const returnedCount = patterns.length;
    const hasNextPage = limit !== undefined && (offset + limit) < totalCount;
    const nextOffset = hasNextPage && limit !== undefined ? offset + limit : undefined;

    // 3. Immutable Result
    return Object.freeze({
      requestId: request.queryId,
      resultId: `RES-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      patterns: Object.freeze(patterns),
      totalCount,
      returnedCount,
      hasNextPage,
      nextOffset
    });
  }

  public async findById(patternId: string): Promise<ReadonlyArray<LearningPattern>> {
    return this.repository.findById(patternId);
  }

  public async findByType(patternType: PatternType): Promise<ReadonlyArray<LearningPattern>> {
    return this.repository.findByType(patternType);
  }

  public async findLatestVersion(patternId: string): Promise<LearningPattern | undefined> {
    const versions = await this.repository.findById(patternId);
    if (versions.length === 0) return undefined;
    
    // versions are usually sorted, but we ensure to grab the max version
    return versions.reduce((latest, current) => current.version > latest.version ? current : latest);
  }

  public async findAll(): Promise<ReadonlyArray<LearningPattern>> {
    return this.repository.findAll();
  }
}
