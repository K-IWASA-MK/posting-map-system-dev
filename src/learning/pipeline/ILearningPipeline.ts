import { LearningRequest } from '../contracts';
import { LearningPipelineResult } from './LearningPipelineResult';

export interface ILearningPipeline {
  run(request: LearningRequest): Promise<LearningPipelineResult>;
}
