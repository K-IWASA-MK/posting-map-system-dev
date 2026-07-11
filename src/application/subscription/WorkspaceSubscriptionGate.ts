import { ApiRequest } from '@core/api/ApiRequest';
import { IWorkspaceSubscriptionRepository } from '@domain/workspace/repositories/IWorkspaceSubscriptionRepository';
import { IStaffRepository } from '@domain/field/staff/repositories/IStaffRepository';
import { SubscriptionException } from '@core/exceptions/SubscriptionException';

export class WorkspaceSubscriptionGate {
  private static instance: WorkspaceSubscriptionGate | null = null;

  constructor(
    private subscriptionRepo: IWorkspaceSubscriptionRepository,
    private staffRepo: IStaffRepository
  ) {
    WorkspaceSubscriptionGate.instance = this;
  }

  public static getInstance(): WorkspaceSubscriptionGate | null {
    return WorkspaceSubscriptionGate.instance;
  }

  public async pass(request: ApiRequest): Promise<void> {
    // 1. Resolve workspaceId
    const workspaceId = await this.resolveWorkspaceId(request);
    if (!workspaceId) {
      // If we cannot resolve workspaceId (e.g. system setup/health check), allow access.
      return;
    }

    // 2. Fetch subscription and check status
    const subscription = await this.subscriptionRepo.findByWorkspaceId(workspaceId);
    if (!subscription) {
      throw new SubscriptionException(
        'PM-SUB-002',
        `Subscription not found for Workspace: ${workspaceId}`,
        request.requestId
      );
    }

    if (!subscription.isActive()) {
      throw new SubscriptionException(
        'PM-SUB-001',
        `Workspace subscription is currently ${subscription.getStatus()}. Access denied.`,
        request.requestId
      );
    }
  }

  private async resolveWorkspaceId(request: ApiRequest): Promise<string | null> {
    // Check path parameters (e.g. /dashboard/workspace/WS-MIE-03)
    if (request.pathParams && request.pathParams.id && request.path.includes('/dashboard/workspace/')) {
      return request.pathParams.id;
    }

    // Check query parameters
    if (request.query && request.query.workspaceId) {
      return request.query.workspaceId;
    }

    // Check request body
    if (request.body && request.body.workspaceId) {
      return request.body.workspaceId;
    }

    // Resolve via lineUserId if present in query/body
    const lineUserId = request.query?.lineUserId || request.body?.lineUserId;
    if (lineUserId) {
      const staff = await this.staffRepo.findByLineUserId(lineUserId);
      if (staff) return staff.workspaceId;
    }

    // Resolve via staffNo if present in query/body
    const staffNo = request.query?.staffNo || request.body?.staffNo;
    if (staffNo) {
      const staff = await this.staffRepo.findByStaffNo(staffNo);
      if (staff) return staff.workspaceId;
    }

    return null;
  }
}
