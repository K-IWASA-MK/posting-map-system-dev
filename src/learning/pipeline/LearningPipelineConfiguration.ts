import { ILearningSourceResolver } from '../source';
import { ILearningEngine } from './ILearningEngine';

export interface LearningPipelineConfiguration {
  readonly resolver: ILearningSourceResolver;
  readonly engine: ILearningEngine;
}
