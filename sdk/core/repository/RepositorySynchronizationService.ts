import { IGitAdapter } from './adapters/IGitAdapter';

export class RepositorySynchronizationService {
  constructor(private gitAdapter: IGitAdapter) {}

  public async fetch(path: string): Promise<void> {
    await this.gitAdapter.fetch(path);
  }

  public async pull(path: string): Promise<void> {
    await this.gitAdapter.pull(path);
  }

  public async push(path: string, branch: string = 'main'): Promise<void> {
    await this.gitAdapter.push(path, branch);
  }

  public async sync(path: string, branch: string = 'main'): Promise<void> {
    await this.fetch(path);
    await this.pull(path);
    await this.push(path, branch);
  }

  public async status(path: string): Promise<string> {
    return await this.gitAdapter.status(path);
  }

  public async getDivergence(path: string): Promise<{ ahead: number, behind: number }> {
    // Usually uses git rev-list --left-right --count HEAD...origin/main
    // We mock the response here for architecture foundation
    return { ahead: 0, behind: 0 };
  }
}
