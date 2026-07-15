import { AIOSEvent } from '../event/AIOSEvent';
import { ProjectEntityState } from './ProjectModels';

export interface ProjectEventPayload extends Record<string, unknown> {
  projectId: string;
}

export interface ProjectCreatedEvent extends AIOSEvent<ProjectEventPayload> {
  eventType: 'ProjectCreatedEvent';
}

export interface EpicCreatedEvent extends AIOSEvent<ProjectEventPayload & { epicId: string }> {
  eventType: 'EpicCreatedEvent';
}

export interface SprintStartedEvent extends AIOSEvent<ProjectEventPayload & { sprintId: string }> {
  eventType: 'SprintStartedEvent';
}

export interface SprintCompletedEvent extends AIOSEvent<ProjectEventPayload & { sprintId: string }> {
  eventType: 'SprintCompletedEvent';
}

export interface IssueCreatedEvent extends AIOSEvent<ProjectEventPayload & { issueId: string }> {
  eventType: 'IssueCreatedEvent';
}

export interface IssueClosedEvent extends AIOSEvent<ProjectEventPayload & { issueId: string }> {
  eventType: 'IssueClosedEvent';
}

export interface TaskCompletedEvent extends AIOSEvent<ProjectEventPayload & { taskId: string, issueId: string }> {
  eventType: 'TaskCompletedEvent';
}
