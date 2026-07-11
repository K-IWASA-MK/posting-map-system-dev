export interface WorkspaceSubscriptionOverviewDto {
  workspaceId: string;
  workspaceName: string;
  status: string; // e.g. "ACTIVE", "SUSPENDED", "CANCELLED"
  startedAt: string; // ISO format
  expiresAt: string; // ISO format
  remainingDays: number;
}
