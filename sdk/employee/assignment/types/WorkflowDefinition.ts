import { AITaskManifest } from './AITaskManifest';

export interface StageDefinition {
  stageId: string;
  stageName: string;
  tasks: AITaskManifest[];
}

export interface WorkflowDefinition {
  workflowId: string;
  workflowName: string;
  stages: StageDefinition[];
}
