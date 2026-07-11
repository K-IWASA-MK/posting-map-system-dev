import { WorkspaceSubscription } from '../entities/WorkspaceSubscription';

export interface IWorkspaceSubscriptionRepository {
  findByWorkspaceId(workspaceId: string): Promise<WorkspaceSubscription | undefined>;
  save(subscription: WorkspaceSubscription): Promise<void>;
}
