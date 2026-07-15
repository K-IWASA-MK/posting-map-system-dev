import { ILearningPipeline } from './ILearningPipeline';
import { LearningPipeline } from './LearningPipeline';
import { LearningPipelineConfiguration } from './LearningPipelineConfiguration';

export class LearningPipelineFactory {
  public static create(config: LearningPipelineConfiguration): ILearningPipeline {
    return new LearningPipeline(config.resolver, config.engine, config.orchestrator);
  }
}
