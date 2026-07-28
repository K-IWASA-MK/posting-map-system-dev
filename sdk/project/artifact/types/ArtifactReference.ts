/**
 * ArtifactReference.ts
 * 
 * Value Object representing an Artifact produced during AIOS Workflow execution
 */

export class ArtifactReference {
  public readonly artifactId: string;
  public readonly artifactType: string;
  public readonly location: string;
  public readonly checksum: string;
  public readonly createdAt: string;

  constructor(
    artifactId: string,
    artifactType: string,
    location: string,
    checksum?: string,
    createdAt?: string
  ) {
    if (!artifactId || artifactId.trim() === '') {
      throw new Error('[ArtifactReference] Artifact ID cannot be empty');
    }
    this.artifactId = artifactId.trim();
    this.artifactType = artifactType || 'FILE';
    this.location = location;
    this.checksum = checksum || `sha256-${Date.now()}`;
    this.createdAt = createdAt || new Date().toISOString();
  }

  public static of(
    artifactId: string,
    location: string,
    artifactType: string = 'DOCUMENT',
    checksum?: string
  ): ArtifactReference {
    return new ArtifactReference(artifactId, artifactType, location, checksum);
  }
}
