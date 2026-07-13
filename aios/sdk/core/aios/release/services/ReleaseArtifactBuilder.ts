export interface IReleaseArtifactBuilder {
  buildArtifacts(repositoryId: string, version: string): Promise<string[]>;
}

export class ReleaseArtifactBuilder implements IReleaseArtifactBuilder {
  public async buildArtifacts(repositoryId: string, version: string): Promise<string[]> {
    console.log(`[ReleaseArtifactBuilder] Building artifacts for ${repositoryId} ${version}`);
    return [`${repositoryId}-${version}.tar.gz`];
  }
}
