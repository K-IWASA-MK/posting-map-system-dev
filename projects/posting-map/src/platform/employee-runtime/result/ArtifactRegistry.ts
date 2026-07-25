/**
 * AIOS Employee Result Foundation
 * Artifact Registry Engine Implementation
 */

import { IArtifactRegistry } from './contract/IResultRegistry';
import { ArtifactRecord } from './models/EmployeeResultModels';

export class ArtifactRegistry implements IArtifactRegistry {
  private artifacts: Map<string, ArtifactRecord> = new Map();
  private resultArtifactMap: Map<string, string[]> = new Map();

  public registerArtifact(resultId: string, artifact: ArtifactRecord): ArtifactRecord {
    // 1. Check for Duplicate ArtifactId
    if (this.artifacts.has(artifact.artifactId)) {
      throw new Error(
        `[Artifact Registry Block] ArtifactId '${artifact.artifactId}' already exists. Duplicate registration rejected.`
      );
    }

    // 2. Freeze Artifact Record (Immutable)
    const frozenArtifact: ArtifactRecord = Object.freeze({ ...artifact });
    this.artifacts.set(artifact.artifactId, frozenArtifact);

    const list = this.resultArtifactMap.get(resultId) || [];
    list.push(artifact.artifactId);
    this.resultArtifactMap.set(resultId, list);

    return frozenArtifact;
  }

  public getArtifacts(resultId: string): ArtifactRecord[] {
    const artifactIds = this.resultArtifactMap.get(resultId) || [];
    return artifactIds.map((id) => this.artifacts.get(id)!);
  }

  public verifyArtifactChecksum(artifactId: string, expectedChecksum: string): boolean {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      throw new Error(`[Artifact Registry Block] ArtifactId '${artifactId}' not found.`);
    }
    return artifact.checksum === expectedChecksum;
  }
}
