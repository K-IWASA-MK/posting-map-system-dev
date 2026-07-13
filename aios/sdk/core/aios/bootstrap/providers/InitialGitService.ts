import { IGitAdapter } from '../../repository/adapters/IGitAdapter';

export class InitialGitService {
  constructor(private gitAdapter: IGitAdapter) {}

  public async initializeAndCommit(directory: string, defaultBranch: string): Promise<void> {
    // Missing init and add on adapter, comment out for now or implement as generic command if available
    await this.gitAdapter.commit(directory, 'chore: initial commit by AIOS Bootstrap');
  }

  public async push(directory: string): Promise<void> {
    await this.gitAdapter.push(directory, 'main');
  }

  public async tag(directory: string, tag: string): Promise<void> {
    await this.gitAdapter.tag(directory, tag);
  }
}
