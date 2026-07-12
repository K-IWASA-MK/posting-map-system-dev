import { LearningPattern, PatternType } from '../contracts';

/**
 * Contract for storing and retrieving AIOS Knowledge Assets (Approved Patterns).
 * It represents the single source of truth for validated patterns.
 */
export interface IPatternRepository {
  /**
   * Saves an APPROVED and validated LearningPattern.
   * Throws PatternRepositoryError if validation fails or duplicate version exists.
   */
  save(pattern: LearningPattern): Promise<void>;

  /**
   * Retrieves all versions of a pattern by its sequence ID or pattern ID.
   */
  findById(patternId: string): Promise<ReadonlyArray<LearningPattern>>;

  /**
   * Retrieves all patterns belonging to a specific PatternType.
   */
  findByType(patternType: PatternType): Promise<ReadonlyArray<LearningPattern>>;

  /**
   * Retrieves all patterns currently stored in the repository.
   */
  findAll(): Promise<ReadonlyArray<LearningPattern>>;

  /**
   * Returns the total count of pattern versions stored.
   */
  count(): Promise<number>;
}
