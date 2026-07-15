import { ILearningSourceResolver } from '../source';
import { ILearningEngine } from './ILearningEngine';
import { IGovernanceOrchestrator } from '../governance';

export interface LearningPipelineConfiguration {
  readonly resolver: ILearningSourceResolver;
  readonly engine: ILearningEngine;
  readonly orchestrator: IGovernanceOrchestrator;
}
