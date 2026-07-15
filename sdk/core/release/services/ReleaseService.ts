import { ReleaseManifest } from '../ReleaseManifest';
import { ISemanticVersionResolver } from './SemanticVersionResolver';
import { IChangelogBuilder } from './ChangelogBuilder';
import { IReleaseArtifactBuilder } from './ReleaseArtifactBuilder';
import { IGitHubReleasePublisher } from './GitHubReleasePublisher';

export class ReleaseService {
  constructor(
    private versionResolver: ISemanticVersionResolver,
    private changelogBuilder: IChangelogBuilder,
    private artifactBuilder: IReleaseArtifactBuilder,
    private publisher: IGitHubReleasePublisher
  ) {}

  public async prepareRelease(manifest: ReleaseManifest): Promise<ReleaseManifest> {
    const version = await this.versionResolver.resolveNextVersion(manifest.repositoryId, manifest.version);
    const notes = manifest.notes || await this.changelogBuilder.buildChangelog(manifest.repositoryId, undefined, version);
    const assets = manifest.assets.length > 0 ? manifest.assets : await this.artifactBuilder.buildArtifacts(manifest.repositoryId, version);

    return { ...manifest, version, notes, assets };
  }

  public async publishRelease(manifest: ReleaseManifest): Promise<string> {
    if (!manifest.version || !manifest.notes) {
      throw new Error('Release manifest is missing version or notes');
    }
    return this.publisher.publishRelease(
      manifest.repositoryId,
      manifest.version,
      manifest.notes,
      manifest.assets,
      manifest.draft,
      manifest.prerelease
    );
  }
}
