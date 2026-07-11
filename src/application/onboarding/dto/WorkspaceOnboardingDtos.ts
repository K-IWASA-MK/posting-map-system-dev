export interface WorkspaceProvisioningDto {
  workspaceId: string;
  workspaceName: string;
  lineAppUrl: string;
  dashboardUrl: string;
  subscriptionStatus: string;
  status: string; // Alias to subscriptionStatus for compatibility
}
