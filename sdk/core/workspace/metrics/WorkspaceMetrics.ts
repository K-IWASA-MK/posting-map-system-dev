export interface WorkspaceMetrics {
  totalRepositories: number;
  totalPlugins: number;
  totalSDKs: number;
  totalWorkers: number;
  totalApplications: number;
  totalPackages: number;
  totalTemplates: number;
  
  dependencyCount: number;
  unresolvedDependencies: number;
  
  lastScannedAt?: string;
  diskUsageBytes: number;
}
