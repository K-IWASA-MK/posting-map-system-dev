import { IPatternRepository } from './IPatternRepository';
import { InMemoryPatternRepository } from './InMemoryPatternRepository';

/**
 * Factory for resolving the active PatternRepository implementation.
 * Currently returns InMemoryPatternRepository, but allows future swapping
 * to SQLite or PostgreSQL without changing consumer code.
 */
export class PatternRepositoryFactory {
  private static instance: IPatternRepository;

  public static getRepository(): IPatternRepository {
    if (!this.instance) {
      this.instance = new InMemoryPatternRepository();
    }
    return this.instance;
  }

  /**
   * Used for testing purposes to reset the repository state.
   */
  public static reset(): void {
    this.instance = new InMemoryPatternRepository();
  }
}
