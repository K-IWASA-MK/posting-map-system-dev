export interface RepositoryMetrics {
  repositoryCount?: number;
  branchCount: number;
  tagCount: number;
  commitCount: number;
  lastCommitAt?: string;
  lastPushAt?: string;
  remoteReachability: boolean;
  aheadOfRemote: number;
  behindRemote: number;
  divergence: boolean;
  cloneSizeBytes: number;
  diskUsageBytes: number;
  lastMeasuredAt: string;
}
