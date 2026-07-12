import { LearningPattern, PatternStatus } from '../contracts';
import { PatternRepositoryError } from './PatternRepositoryError';

export class PatternRepositoryValidator {
  /**
   * Validates if a LearningPattern is fit to be stored as an AIOS Knowledge Asset.
   * Checks:
   * 1. status === APPROVED
   * 2. evaluation !== undefined
   * 3. Object.isFrozen(pattern)
   */
  public static validateForSave(pattern: LearningPattern): void {
    if (pattern.status !== PatternStatus.APPROVED) {
      throw new PatternRepositoryError(`Cannot save pattern. Expected status APPROVED, got ${pattern.status}`);
    }

    if (!pattern.evaluation) {
      throw new PatternRepositoryError(`Cannot save pattern. Evaluation data is missing.`);
    }

    if (pattern.version < 1) {
      throw new PatternRepositoryError(
        `Pattern ${pattern.patternId} has version ${pattern.version}. Only patterns with version >= 1 can be saved to the repository.`
      );
    }

    if (!Object.isFrozen(pattern)) {
      throw new PatternRepositoryError(`Cannot save pattern. The pattern object must be immutable (frozen).`);
    }

    // Additional safety check: Ensure evaluation itself is also frozen
    if (!Object.isFrozen(pattern.evaluation)) {
      throw new PatternRepositoryError(`Cannot save pattern. The evaluation object must be immutable (frozen).`);
    }
  }
}
