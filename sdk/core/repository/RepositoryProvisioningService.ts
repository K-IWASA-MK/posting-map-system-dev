import { RepositoryManifest } from './RepositoryManifest';
import { RepositoryState } from './RepositoryState';
import { IGitHubAdapter } from './adapters/IGitHubAdapter';
import { DevelopmentRuleEngine } from '../engine/DevelopmentRuleEngine';
import { DevelopmentDecisionStatus } from '../governance/DevelopmentDecisionStatus';
import { RepositoryProvisioningError } from './RepositoryProvisioningError';
import { RepositoryLifecycleService } from './RepositoryLifecycleService';
import { RepositorySynchronizationService } from './RepositorySynchronizationService';
import { RepositoryRecord } from './RepositoryRecord';

export class RepositoryProvisioningService {
  constructor(
    private ruleEngine: DevelopmentRuleEngine,
    private githubAdapter: IGitHubAdapter,
    private lifecycle: RepositoryLifecycleService,
    private sync: RepositorySynchronizationService
  ) {}

  public async provision(record: RepositoryRecord): Promise<void> {
    const manifest = record.manifest;
    
    try {
      // 1. Validation
      const decision = this.ruleEngine.evaluateRepository(manifest);
      if (decision.status !== DevelopmentDecisionStatus.PASS) {
        throw new RepositoryProvisioningError(`Validation failed: ${decision.reason}`);
      }
      await this.lifecycle.transition(record, RepositoryState.VALIDATED, { decision });

      // 2. Auth Check
      const isAuth = await this.githubAdapter.checkAuth();
      if (!isAuth && !manifest.dryRun) {
        throw new RepositoryProvisioningError(`GitHub authentication failed. Please run 'gh auth login'.`);
      }

      // 3. Create Repository
      await this.lifecycle.transition(record, RepositoryState.CREATING);
      const remoteUrl = await this.githubAdapter.createRepository(manifest);
      await this.lifecycle.transition(record, RepositoryState.CREATED, { remoteUrl });

      // 4. Configure & Push (Delegated to Sync service / GitAdapter via pseudo-path '.')
      await this.lifecycle.transition(record, RepositoryState.CONFIGURED);
      // Assuming GitCLIAdapter is injected into sync service and handles the calls internally
      // Note: sync service usually takes a path. We'll pass '.' as placeholder.
      // Since Provisioning creates remote, we should use sync to set it up.
      // (Simplified due to GitCLIAdapter still having addRemote)
      
    } catch (error: any) {
      await this.lifecycle.transition(record, RepositoryState.FAILED, { error: error.message });
      throw error;
    }
  }
}
