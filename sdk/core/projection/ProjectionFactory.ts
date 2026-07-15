import { InMemoryProjectionRepository } from './InMemoryProjectionRepository';
import { ProjectionBuilder } from './ProjectionBuilder';
import { ProjectionDispatcher } from './ProjectionDispatcher';

export class ProjectionFactory {
  public static createInMemory() {
    const repository = new InMemoryProjectionRepository();
    const builder = new ProjectionBuilder(repository);
    const dispatcher = new ProjectionDispatcher(builder);

    return {
      repository,
      builder,
      dispatcher
    };
  }
}
