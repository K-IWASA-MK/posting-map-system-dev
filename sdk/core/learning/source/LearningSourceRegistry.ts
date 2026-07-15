import { ILearningSource } from './ILearningSource';

export class LearningSourceRegistry {
  private sources: ILearningSource[] = [];

  public register(source: ILearningSource): void {
    this.sources.push(source);
    // Determine priority sorting (highest first)
    this.sources.sort((a, b) => b.priority() - a.priority());
  }

  public getAll(): ILearningSource[] {
    return [...this.sources];
  }

  public clear(): void {
    this.sources = [];
  }
}
