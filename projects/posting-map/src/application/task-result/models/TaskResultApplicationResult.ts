import { RepositoryUpdateRequest } from './RepositoryUpdateRequest';
import { ProjectionUpdateRequest } from './ProjectionUpdateRequest';
import { NotificationRequest } from './NotificationRequest';
import { AuditRecordRequest } from './AuditRecordRequest';

export class TaskResultApplicationResult {
  public readonly repositoryUpdated: boolean;
  public readonly dashboardProjected: boolean;
  public readonly notificationPublished: boolean;
  public readonly auditRecorded: boolean;

  // Provide references to the generated requests for testability and inspection
  public readonly repositoryRequest?: RepositoryUpdateRequest;
  public readonly projectionRequest?: ProjectionUpdateRequest;
  public readonly notificationRequest?: NotificationRequest;
  public readonly auditRequest?: AuditRecordRequest;

  constructor(params: {
    repositoryUpdated: boolean;
    dashboardProjected: boolean;
    notificationPublished: boolean;
    auditRecorded: boolean;
    repositoryRequest?: RepositoryUpdateRequest;
    projectionRequest?: ProjectionUpdateRequest;
    notificationRequest?: NotificationRequest;
    auditRequest?: AuditRecordRequest;
  }) {
    this.repositoryUpdated = params.repositoryUpdated;
    this.dashboardProjected = params.dashboardProjected;
    this.notificationPublished = params.notificationPublished;
    this.auditRecorded = params.auditRecorded;
    this.repositoryRequest = params.repositoryRequest;
    this.projectionRequest = params.projectionRequest;
    this.notificationRequest = params.notificationRequest;
    this.auditRequest = params.auditRequest;

    Object.freeze(this);
  }
}
