import { IGitHubAdapter } from './IGitHubAdapter';
import { RepositoryManifest } from '../RepositoryManifest';
import { GitHubCommandBuilder } from './GitHubCommandBuilder';
import { RepositoryProvisioningError } from '../RepositoryProvisioningError';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GitHubCLIAdapter implements IGitHubAdapter {
  private builder = new GitHubCommandBuilder();
  private isDryRun = false;

  public setDryRun(dryRun: boolean): void {
    this.isDryRun = dryRun;
  }

  private async executeCommand(cmd: string): Promise<string> {
    if (this.isDryRun) {
      console.log(`[DryRun] Would execute: ${cmd}`);
      return `[DryRun] Success for: ${cmd}`;
    }
    const { stdout } = await execAsync(cmd);
    return stdout.trim();
  }

  public async checkAuth(): Promise<boolean> {
    try {
      await this.executeCommand(this.builder.buildCheckAuthCommand());
      return true;
    } catch {
      return false;
    }
  }

  public async createRepository(manifest: RepositoryManifest): Promise<string> {
    try {
      await this.executeCommand(this.builder.buildCreateCommand(manifest.repositoryName, manifest.visibility));
      return `https://github.com/${manifest.owner}/${manifest.repositoryName}.git`;
    } catch (err: any) {
      throw new RepositoryProvisioningError(`Failed to create repository ${manifest.repositoryName}`, err);
    }
  }

  public async deleteRepository(owner: string, repositoryName: string): Promise<void> {
    await this.executeCommand(this.builder.buildDeleteCommand(owner, repositoryName));
  }

  public async archiveRepository(owner: string, repositoryName: string): Promise<void> {
    await this.executeCommand(this.builder.buildArchiveCommand(owner, repositoryName));
  }

  public async renameRepository(owner: string, oldName: string, newName: string): Promise<void> {
    await this.executeCommand(this.builder.buildRenameCommand(owner, oldName, newName));
  }

  public async forkRepository(owner: string, repositoryName: string, org?: string): Promise<string> {
    await this.executeCommand(this.builder.buildForkCommand(owner, repositoryName, org));
    return `https://github.com/${org || 'current-user'}/${repositoryName}.git`; // Rough estimate
  }

  public async listRepositories(owner: string): Promise<any[]> {
    const output = await this.executeCommand(this.builder.buildListRepositoriesCommand(owner));
    return this.isDryRun ? [] : JSON.parse(output || '[]');
  }

  public async listBranches(owner: string, repositoryName: string): Promise<any[]> {
    // Requires API or different approach since gh CLI doesn't have a direct branch list command easily returning JSON
    return []; 
  }

  public async listTags(owner: string, repositoryName: string): Promise<any[]> {
    return [];
  }

  public async createRelease(owner: string, repositoryName: string, tag: string, title: string, notes: string): Promise<void> {
    await this.executeCommand(this.builder.buildCreateReleaseCommand(owner, repositoryName, tag, title, notes));
  }

  public async createPullRequest(owner: string, repositoryName: string, title: string, body: string, head: string, base: string): Promise<string> {
    const result = await this.executeCommand(this.builder.buildCreatePullRequestCommand(owner, repositoryName, title, body, head, base));
    return result; // PR URL
  }

  public async mergePullRequest(owner: string, repositoryName: string, prNumber: number): Promise<void> {
    await this.executeCommand(this.builder.buildMergePullRequestCommand(owner, repositoryName, prNumber));
  }

  public async protectBranch(owner: string, repositoryName: string, branch: string): Promise<void> {
    // GraphQL or API call usually required for branch protection
    if (this.isDryRun) console.log(`[DryRun] Would execute branch protection for ${branch}`);
  }

  public async createWebhook(owner: string, repositoryName: string, url: string, secret: string): Promise<void> {
    if (this.isDryRun) console.log(`[DryRun] Would execute webhook creation for ${url}`);
  }
}
