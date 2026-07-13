export interface WorkspaceDto {
  workspaceId: string;
  workspaceName: string;
  lineAppUrl: string;
  dashboardUrl: string;
  subscriptionStatus: string;
  status: string; // Alias to subscriptionStatus for compatibility
  distributionGoal: number | null;
  goalUpdatedAt: string | null;
  goalUpdatedBy: string | null;
}
