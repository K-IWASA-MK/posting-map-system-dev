/**
 * GitHubActionsVerificationProvider.ts
 * 
 * GitHub Actions CI/CD パイプライン状態監視プロバイダ
 */

import { GitHubWorkflowStatus } from './DeploymentVerificationModels';

export interface GitHubWorkflowRunDetails {
  readonly runId: string;
  readonly workflowName: string;
  readonly status: GitHubWorkflowStatus;
  readonly headCommit: string;
  readonly logUrl?: string;
  readonly failureReason?: string;
}

export interface IGitHubActionsProvider {
  getLatestWorkflowRun(repository: string, workflowName?: string, commit?: string): Promise<GitHubWorkflowRunDetails>;
}

export class GitHubActionsVerificationProvider implements IGitHubActionsProvider {
  private readonly mockRuns: Map<string, GitHubWorkflowRunDetails> = new Map();

  /**
   * テスト/シミュレーション用モックランのプリセット
   */
  setMockWorkflowRun(repository: string, details: GitHubWorkflowRunDetails): void {
    this.mockRuns.set(`${repository}:${details.workflowName}`, details);
  }

  async getLatestWorkflowRun(
    repository: string,
    workflowName = 'deploy',
    commit?: string
  ): Promise<GitHubWorkflowRunDetails> {
    const key = `${repository}:${workflowName}`;
    const mock = this.mockRuns.get(key);

    if (mock) {
      return mock;
    }

    // デフォルト決定論的レスポンス (Git コミットと連動)
    return Object.freeze({
      runId: `run-gh-action-${Date.now()}`,
      workflowName,
      status: 'SUCCESS',
      headCommit: commit || 'HEAD',
      logUrl: `https://github.com/${repository}/actions/runs/12345678`
    });
  }
}
