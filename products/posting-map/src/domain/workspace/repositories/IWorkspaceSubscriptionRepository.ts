import { WorkspaceSubscription } from '../entities/WorkspaceSubscription';

export interface IWorkspaceSubscriptionRepository {
  findByWorkspaceId(workspaceId: string): Promise<WorkspaceSubscription | undefined>;
  findAll(): Promise<WorkspaceSubscription[]>;
  save(subscription: WorkspaceSubscription): Promise<void>;
  create(subscription: WorkspaceSubscription): Promise<void>;
}
