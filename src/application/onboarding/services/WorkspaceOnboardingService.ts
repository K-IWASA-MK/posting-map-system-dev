import { Workspace } from '@domain/workspace/entities/Workspace';
import { WorkspaceSubscription } from '@domain/workspace/entities/WorkspaceSubscription';
import { WorkspaceUrl } from '@domain/workspace/valueobjects/WorkspaceUrl';
import { IWorkspaceRepository } from '@domain/workspace/repositories/IWorkspaceRepository';
import { IWorkspaceSubscriptionRepository } from '@domain/workspace/repositories/IWorkspaceSubscriptionRepository';
import { WorkspaceIdGenerator } from './WorkspaceIdGenerator';
import { WorkspaceProvisioningDto } from '../dto/WorkspaceOnboardingDtos';

export class WorkspaceOnboardingService {
  constructor(
    private workspaceRepo: IWorkspaceRepository,
    private subscriptionRepo: IWorkspaceSubscriptionRepository
  ) {}

  public async createWorkspace(
    workspaceName: string,
    workspaceId?: string,
    periodMonths: number = 1
  ): Promise<WorkspaceProvisioningDto> {
    if (!workspaceName || workspaceName.trim().length === 0) {
      throw new Error('Workspace name is required');
    }

    // Resolve base workspace ID
    let finalId = workspaceId ? workspaceId.trim() : WorkspaceIdGenerator.generate(workspaceName);
    
    // Ensure uniqueness by checking existence and appending counter suffix if necessary
    const baseId = finalId;
    let counter = 1;
    while (await this.workspaceRepo.findById(finalId)) {
      counter++;
      finalId = `${baseId}-${counter}`;
    }

    // Create and save Workspace
    const workspace = new Workspace({
      workspaceId: finalId,
      workspaceName,
      status: 'ACTIVE'
    });
    await this.workspaceRepo.save(workspace);

    // Create and save initial Subscription (ACTIVE, default duration 1 month)
    const startedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(startedAt.getMonth() + periodMonths);

    const subscription = new WorkspaceSubscription({
      workspaceId: finalId,
      status: 'ACTIVE',
      startedAt,
      expiresAt
    });
    await this.subscriptionRepo.create(subscription);

    // Generate Workspace URLs dynamically
    const urls = WorkspaceUrl.generate(finalId);

    return {
      workspaceId: finalId,
      workspaceName,
      lineAppUrl: urls.lineAppUrl,
      dashboardUrl: urls.dashboardUrl,
      subscriptionStatus: 'ACTIVE',
      status: 'ACTIVE'
    };
  }

  public async activateWorkspace(workspaceId: string): Promise<void> {
    const sub = await this.subscriptionRepo.findByWorkspaceId(workspaceId);
    if (!sub) {
      throw new Error(`Subscription not found for workspaceId: ${workspaceId}`);
    }
    sub.reactivate();
    await this.subscriptionRepo.save(sub);
  }

  public async suspendWorkspace(workspaceId: string): Promise<void> {
    const sub = await this.subscriptionRepo.findByWorkspaceId(workspaceId);
    if (!sub) {
      throw new Error(`Subscription not found for workspaceId: ${workspaceId}`);
    }
    sub.suspend();
    await this.subscriptionRepo.save(sub);
  }

  public async getWorkspaceProvisioningStatus(workspaceId: string): Promise<WorkspaceProvisioningDto> {
    const workspace = await this.workspaceRepo.findById(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    const sub = await this.subscriptionRepo.findByWorkspaceId(workspaceId);
    const subStatus = sub ? sub.getStatus() : 'INACTIVE';
    const urls = WorkspaceUrl.generate(workspaceId);

    return {
      workspaceId: workspace.workspaceId,
      workspaceName: workspace.workspaceName,
      lineAppUrl: urls.lineAppUrl,
      dashboardUrl: urls.dashboardUrl,
      subscriptionStatus: subStatus,
      status: subStatus
    };
  }
}
