import { AIOSEvent } from '../event/AIOSEvent';
import { WorkflowState } from './WorkflowModels';

export interface WorkflowEventPayload extends Record<string, unknown> {
  workflowId: string;
  jobId: string;
}

export interface WorkflowStartedEvent extends AIOSEvent<WorkflowEventPayload> {
  eventType: 'WorkflowStartedEvent';
}

export interface WorkflowStepStartedEvent extends AIOSEvent<WorkflowEventPayload & { stepId: string }> {
  eventType: 'WorkflowStepStartedEvent';
}

export interface WorkflowStepCompletedEvent extends AIOSEvent<WorkflowEventPayload & { stepId: string, result: Record<string, unknown> }> {
  eventType: 'WorkflowStepCompletedEvent';
}

export interface WorkflowPausedEvent extends AIOSEvent<WorkflowEventPayload & { reason: string }> {
  eventType: 'WorkflowPausedEvent';
}

export interface WorkflowFailedEvent extends AIOSEvent<WorkflowEventPayload & { reason: string, failedStepId?: string }> {
  eventType: 'WorkflowFailedEvent';
}

export interface WorkflowCompletedEvent extends AIOSEvent<WorkflowEventPayload> {
  eventType: 'WorkflowCompletedEvent';
}
