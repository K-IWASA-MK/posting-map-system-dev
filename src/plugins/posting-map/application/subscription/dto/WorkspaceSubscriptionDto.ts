import { SubscriptionStatus } from '@domain/workspace/entities/WorkspaceSubscription';

export interface WorkspaceSubscriptionDto {
  workspaceId: string;
  status: SubscriptionStatus;
  startedAt: string; // ISO 8601 string
  expiresAt: string; // ISO 8601 string
}
