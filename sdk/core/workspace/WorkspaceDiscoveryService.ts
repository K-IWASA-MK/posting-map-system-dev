import { WorkspaceManifest } from './WorkspaceManifest';
import { WorkspaceRegistry } from './WorkspaceRegistry';
import { RepositoryManifest } from '../repository/RepositoryManifest';
import { RepositoryRegistry } from '../repository/RepositoryRegistry';
import { RepositoryState } from '../repository/RepositoryState';
import { RepositoryHealthStatus } from '../repository/RepositoryHealth';

export class WorkspaceDiscoveryService {
  constructor(
    private workspaceRegistry: WorkspaceRegistry,
    private repositoryRegistry: RepositoryRegistry
  ) {}

  public async discover(workspaceId: string): Promise<void> {
    const workspace = this.workspaceRegistry.getById(workspaceId);
    if (!workspace) throw new Error(`Workspace ${workspaceId} not found.`);

    console.log(`[WorkspaceDiscovery] Scanning root directory: ${workspace.manifest.rootDirectory}...`);
    // Placeholder for actual file system discovery logic.
    // In reality, this would scan for .git, package.json, aios-manifest.json, etc.
    // Detect Repositories, Plugins, SDKs, Workers, Applications, Packages, Templates.

    // Mock discovered repository
    const mockDiscoveredRepoManifest: RepositoryManifest = {
      repositoryName: 'discovered-plugin',
      repositoryType: 'PLUGIN' as any,
      owner: workspace.manifest.owner,
      visibility: 'private'
    };

    console.log(`[WorkspaceDiscovery] Discovered repository: ${mockDiscoveredRepoManifest.repositoryName}`);
    
    // Auto-register to RepositoryRegistry
    this.repositoryRegistry.register({
      id: mockDiscoveredRepoManifest.repositoryName,
      manifest: mockDiscoveredRepoManifest,
      state: RepositoryState.READY, // Assuming already exists locally
      health: {
        status: RepositoryHealthStatus.UNKNOWN,
        gitHubStatus: RepositoryHealthStatus.UNKNOWN,
        gitStatus: RepositoryHealthStatus.UNKNOWN,
        networkStatus: RepositoryHealthStatus.UNKNOWN,
        authStatus: RepositoryHealthStatus.UNKNOWN,
        lastCheckedAt: new Date().toISOString(),
        issues: []
      },
      metrics: {
        branchCount: 0, tagCount: 0, commitCount: 0, remoteReachability: true,
        aheadOfRemote: 0, behindRemote: 0, divergence: false, cloneSizeBytes: 0, diskUsageBytes: 0,
        lastMeasuredAt: new Date().toISOString()
      },
      history: { lastEventId: '' }
    });

    workspace.manifest.repositories.push(mockDiscoveredRepoManifest.repositoryName);
  }
}
