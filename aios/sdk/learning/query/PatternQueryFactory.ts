import { IPatternQueryService } from './IPatternQueryService';
import { PatternQueryService } from './PatternQueryService';
import { PatternRepositoryFactory } from '../repository/PatternRepositoryFactory';

export class PatternQueryFactory {
  private static instance: IPatternQueryService;

  public static getQueryService(): IPatternQueryService {
    if (!this.instance) {
      // Inject Repository dynamically via RepositoryFactory
      const repository = PatternRepositoryFactory.getRepository();
      this.instance = new PatternQueryService(repository);
    }
    return this.instance;
  }
}
