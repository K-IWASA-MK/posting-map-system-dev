export interface DeploymentPolicy {
  requireTestsPassed: boolean;
  minTestCoveragePercent: number;
  requireSecurityScan: boolean;
  autoRollbackOnFailure: boolean;
}

export const DefaultDeploymentPolicy: DeploymentPolicy = {
  requireTestsPassed: true,
  minTestCoveragePercent: 80,
  requireSecurityScan: false,
  autoRollbackOnFailure: true
};
