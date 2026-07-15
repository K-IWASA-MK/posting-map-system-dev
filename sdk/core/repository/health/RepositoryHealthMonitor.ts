import { RepositoryHealthStatus, RepositoryHealth } from '../RepositoryHealth';
import { IGitHubAdapter } from '../adapters/IGitHubAdapter';
import { RepositoryRecord } from '../RepositoryRecord';

export class RepositoryHealthMonitor {
  constructor(private githubAdapter: IGitHubAdapter) {}

  public async checkHealth(record: RepositoryRecord): Promise<RepositoryHealth> {
    let authStatus = RepositoryHealthStatus.HEALTHY;
    let gitHubStatus = RepositoryHealthStatus.HEALTHY;
    
    try {
      const isAuth = await this.githubAdapter.checkAuth();
      if (!isAuth) authStatus = RepositoryHealthStatus.ERROR;
    } catch {
      authStatus = RepositoryHealthStatus.ERROR;
    }

    // GitHub remote check could be a listRepositories lookup
    try {
      const repos = await this.githubAdapter.listRepositories(record.manifest.owner);
      const exists = repos.some((r: any) => r.name === record.manifest.repositoryName);
      if (!exists) gitHubStatus = RepositoryHealthStatus.WARNING;
    } catch {
      gitHubStatus = RepositoryHealthStatus.UNKNOWN;
    }

    const overallStatus = [authStatus, gitHubStatus].includes(RepositoryHealthStatus.ERROR) 
      ? RepositoryHealthStatus.ERROR 
      : RepositoryHealthStatus.HEALTHY;

    return {
      status: overallStatus,
      gitHubStatus,
      gitStatus: RepositoryHealthStatus.UNKNOWN, // Needs local Git check
      networkStatus: RepositoryHealthStatus.HEALTHY,
      authStatus,
      lastCheckedAt: new Date().toISOString(),
      issues: []
    };
  }
}
