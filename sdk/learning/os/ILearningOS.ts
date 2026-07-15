import { ILearningPipeline } from '../pipeline';
import { IPatternQueryService } from '../query';
import { LearningOSHealth } from './LearningOSHealth';
import { LearningVersion } from './LearningVersion';

export interface ILearningOS {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  
  health(): LearningOSHealth;
  version(): LearningVersion;

  pipeline(): ILearningPipeline;
  query(): IPatternQueryService;
}
