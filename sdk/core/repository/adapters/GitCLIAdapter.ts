import { IGitAdapter } from './IGitAdapter';
import { RepositoryProvisioningError } from '../RepositoryProvisioningError';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GitCLIAdapter implements IGitAdapter {
  private isDryRun = false;

  public setDryRun(dryRun: boolean): void {
    this.isDryRun = dryRun;
  }

  private async executeCommand(cmd: string, cwd?: string): Promise<string> {
    if (this.isDryRun) {
      console.log(`[DryRun] Would execute: ${cmd} (in ${cwd || 'current directory'})`);
      return `[DryRun] Success for: ${cmd}`;
    }
    const { stdout } = await execAsync(cmd, { cwd });
    return stdout.trim();
  }

  public async clone(url: string, path: string): Promise<void> { await this.executeCommand(`git clone ${url} ${path}`); }
  public async fetch(path: string): Promise<void> { await this.executeCommand(`git fetch --all`, path); }
  public async pull(path: string): Promise<void> { await this.executeCommand(`git pull`, path); }
  public async push(path: string, branch: string): Promise<void> { await this.executeCommand(`git push origin ${branch}`, path); }
  public async status(path: string): Promise<string> { return await this.executeCommand(`git status -s`, path); }
  public async diff(path: string): Promise<string> { return await this.executeCommand(`git diff`, path); }
  public async checkout(path: string, branch: string): Promise<void> { await this.executeCommand(`git checkout ${branch}`, path); }
  public async commit(path: string, message: string): Promise<void> { await this.executeCommand(`git commit -m "${message}"`, path); }
  public async tag(path: string, tag: string): Promise<void> { await this.executeCommand(`git tag ${tag}`, path); }
  public async stash(path: string): Promise<void> { await this.executeCommand(`git stash`, path); }
  public async clean(path: string): Promise<void> { await this.executeCommand(`git clean -fd`, path); }
  public async gc(path: string): Promise<void> { await this.executeCommand(`git gc`, path); }

  public async addRemote(path: string, remoteUrl: string): Promise<void> {
    try {
      await this.executeCommand(`git remote add origin ${remoteUrl}`, path);
    } catch (err: any) {
      if (!err.message.includes('already exists')) {
        throw new RepositoryProvisioningError(`Failed to add remote origin`, err);
      }
    }
  }

  public async pushInitial(path: string, defaultBranch?: string): Promise<void> {
    const branch = defaultBranch || 'main';
    await this.executeCommand(`git push -u origin ${branch}`, path);
  }

  public async pushTags(path: string): Promise<void> {
    await this.executeCommand(`git push --tags`, path);
  }
}
