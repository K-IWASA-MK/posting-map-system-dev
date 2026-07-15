import { KnowledgeRequest } from '../contracts';
import { KnowledgePipelineResult } from './KnowledgePipelineResult';

export interface IKnowledgePipeline {
  run(request: KnowledgeRequest): Promise<KnowledgePipelineResult>;
}
