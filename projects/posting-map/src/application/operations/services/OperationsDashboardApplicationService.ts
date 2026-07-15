import { IWorkspaceRepository } from '@domain/workspace/repositories/IWorkspaceRepository';
import { IWorkspaceSubscriptionRepository } from '@domain/workspace/repositories/IWorkspaceSubscriptionRepository';
import { WorkspaceSubscriptionOverviewDto } from '../dto/OperationsDashboardDtos';

export class OperationsDashboardApplicationService {
  constructor(
    private workspaceRepo: IWorkspaceRepository,
    private subscriptionRepo: IWorkspaceSubscriptionRepository
  ) {}

  public async getWorkspaceSubscriptionOverview(): Promise<WorkspaceSubscriptionOverviewDto[]> {
    const workspaces = await this.workspaceRepo.findAll();
    const list: WorkspaceSubscriptionOverviewDto[] = [];

    for (const ws of workspaces) {
      const sub = await this.subscriptionRepo.findByWorkspaceId(ws.workspaceId);
      
      const status = sub ? sub.getStatus() : 'INACTIVE';
      const startedAt = sub ? sub.getStartedAt() : new Date();
      const expiresAt = sub ? sub.getExpiresAt() : new Date(0); // Epoch start if not found

      const remainingDays = this.calculateRemainingDays(expiresAt);

      list.push({
        workspaceId: ws.workspaceId,
        workspaceName: ws.workspaceName,
        status,
        startedAt: startedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        remainingDays
      });
    }

    return list;
  }

  private calculateRemainingDays(expiresAt: Date): number {
    const today = new Date();
    // Normalize to midnight to avoid timezone hour offset anomalies
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const startOfExpires = new Date(expiresAt.getFullYear(), expiresAt.getMonth(), expiresAt.getDate(), 0, 0, 0, 0);

    if (startOfExpires.getTime() <= startOfToday.getTime()) {
      return 0;
    }

    const diffTime = startOfExpires.getTime() - startOfToday.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
