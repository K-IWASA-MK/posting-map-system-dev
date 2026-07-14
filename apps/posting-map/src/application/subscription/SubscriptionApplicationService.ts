import { IWorkspaceSubscriptionRepository } from '@domain/workspace/repositories/IWorkspaceSubscriptionRepository';
import { WorkspaceSubscription, SubscriptionStatus } from '@domain/workspace/entities/WorkspaceSubscription';
import { WorkspaceSubscriptionDto } from './dto/WorkspaceSubscriptionDto';

export class SubscriptionApplicationService {
  constructor(
    private subscriptionRepo: IWorkspaceSubscriptionRepository
  ) {}

  public async getSubscription(workspaceId: string): Promise<WorkspaceSubscriptionDto | undefined> {
    const sub = await this.subscriptionRepo.findByWorkspaceId(workspaceId);
    if (!sub) return undefined;
    return this.toDto(sub);
  }

  public async getAllSubscriptions(): Promise<WorkspaceSubscriptionDto[]> {
    const subs = await this.subscriptionRepo.findAll();
    return subs.map(sub => this.toDto(sub));
  }

  public async updateSubscription(workspaceId: string, status: SubscriptionStatus, expiresAt: Date): Promise<void> {
    const existing = await this.subscriptionRepo.findByWorkspaceId(workspaceId);
    const startedAt = existing ? existing.getStartedAt() : new Date();

    const updated = new WorkspaceSubscription({
      workspaceId,
      status,
      startedAt,
      expiresAt
    });
    await this.subscriptionRepo.save(updated);
  }

  private toDto(sub: WorkspaceSubscription): WorkspaceSubscriptionDto {
    return {
      workspaceId: sub.workspaceId,
      status: sub.getStatus(),
      startedAt: sub.getStartedAt().toISOString(),
      expiresAt: sub.getExpiresAt().toISOString()
    };
  }
}
