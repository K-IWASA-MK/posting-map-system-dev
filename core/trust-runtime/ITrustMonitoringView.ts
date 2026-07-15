/**
 * ITrustMonitoringView abstracts access to aggregate runtime metrics used during trust evaluation.
 */
export interface ITrustMonitoringView {
  /**
   * Returns authorization failure counts for a specific plugin.
   * @param pluginId Target plugin ID.
   */
  getPermissionDenialsCount(pluginId: string): number;

  /**
   * Returns locked workspace collision counts for a project.
   * @param projectId Target project ID.
   */
  getWorkspaceLocksBlockedCount(projectId: string): number;
}
