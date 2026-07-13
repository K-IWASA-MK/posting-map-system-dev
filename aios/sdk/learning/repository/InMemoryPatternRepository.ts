import { LearningPattern, PatternType } from '../contracts';
import { IPatternRepository } from './IPatternRepository';
import { PatternRepositoryError } from './PatternRepositoryError';
import { PatternRepositoryValidator } from './PatternRepositoryValidator';

export class InMemoryPatternRepository implements IPatternRepository {
  private readonly patterns = new Map<string, LearningPattern[]>();

  public async save(pattern: LearningPattern): Promise<void> {
    PatternRepositoryValidator.validateForSave(pattern);

    const existingVersions = this.patterns.get(pattern.patternId) || [];
    
    // Duplicate Protection
    if (existingVersions.some(p => p.version === pattern.version)) {
      throw new PatternRepositoryError(`Duplicate pattern version rejected. Pattern ID: ${pattern.patternId}, Version: ${pattern.version} already exists.`);
    }

    // Since pattern is frozen, we can safely store the reference
    existingVersions.push(pattern);
    this.patterns.set(pattern.patternId, existingVersions);
  }

  public async findById(patternId: string): Promise<ReadonlyArray<LearningPattern>> {
    const versions = this.patterns.get(patternId) || [];
    // Sort by version ascending
    return Object.freeze([...versions].sort((a, b) => a.version - b.version));
  }

  public async findByType(patternType: PatternType): Promise<ReadonlyArray<LearningPattern>> {
    const results: LearningPattern[] = [];
    this.patterns.forEach((versions) => {
      for (const pattern of versions) {
        if (pattern.patternType === patternType) {
          results.push(pattern);
        }
      }
    });
    return Object.freeze(results);
  }

  public async findAll(): Promise<ReadonlyArray<LearningPattern>> {
    const results: LearningPattern[] = [];
    this.patterns.forEach((versions) => {
      results.push(...versions);
    });
    return Object.freeze(results);
  }

  public async count(): Promise<number> {
    let total = 0;
    this.patterns.forEach((versions) => {
      total += versions.length;
    });
    return total;
  }
}
