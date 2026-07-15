import { AIOSEvent } from '../event/AIOSEvent';
import { DeploymentStage } from './DeploymentModels';

export interface DeploymentEventPayload extends Record<string, unknown> {
  jobId: string;
  projectId: string;
}

export interface DeploymentStartedEvent extends AIOSEvent<DeploymentEventPayload> {
  eventType: 'DeploymentStartedEvent';
}

export interface DeploymentStageCompletedEvent extends AIOSEvent<DeploymentEventPayload & { stage: DeploymentStage, result: Record<string, unknown> }> {
  eventType: 'DeploymentStageCompletedEvent';
}

export interface DeploymentFailedEvent extends AIOSEvent<DeploymentEventPayload & { stage: DeploymentStage, reason: string }> {
  eventType: 'DeploymentFailedEvent';
}

export interface DeploymentRollbackEvent extends AIOSEvent<DeploymentEventPayload & { environment: string, reason: string }> {
  eventType: 'DeploymentRollbackEvent';
}

export interface DeploymentCompletedEvent extends AIOSEvent<DeploymentEventPayload & { deploymentUrl?: string }> {
  eventType: 'DeploymentCompletedEvent';
}
