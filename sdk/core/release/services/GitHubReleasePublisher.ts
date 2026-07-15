export interface IGitHubReleasePublisher {
  publishRelease(repositoryId: string, version: string, notes: string, assets: string[], isDraft: boolean, isPrerelease: boolean): Promise<string>;
}

export class GitHubReleasePublisher implements IGitHubReleasePublisher {
  public async publishRelease(repositoryId: string, version: string, notes: string, assets: string[], isDraft: boolean, isPrerelease: boolean): Promise<string> {
    console.log(`[GitHubReleasePublisher] Publishing ${repositoryId} ${version} (draft: ${isDraft}, prerelease: ${isPrerelease})`);
    return `https://github.com/mock-owner/${repositoryId}/releases/tag/${version}`;
  }
}
