/**
 * ArtifactOwnership.ts
 * 
 * Implements Principle 002 (Project Ownership Principle).
 * Guarantees that all artifacts, source code, data, and state belong strictly to the project.
 */

export type OwnershipMode = 'PROJECT_EXCLUSIVE';

export interface ArtifactOwnershipDescriptor {
  readonly artifactId: string;
  readonly projectId: string;
  readonly mode: OwnershipMode;
  readonly aiosOwnershipAllowed: false;
  readonly createdAt: string;
}

export class ArtifactOwnership {
  public static createProjectOwnership(artifactId: string, projectId: string): ArtifactOwnershipDescriptor {
    if (!artifactId || artifactId.trim().length === 0) {
      throw new Error('[ArtifactOwnership] ArtifactId is required');
    }
    if (!projectId || projectId.trim().length === 0) {
      throw new Error('[ArtifactOwnership] ProjectId is required');
    }

    return Object.freeze({
      artifactId,
      projectId,
      mode: 'PROJECT_EXCLUSIVE',
      aiosOwnershipAllowed: false,
      createdAt: new Date().toISOString()
    });
  }

  public static validateOwnership(descriptor: ArtifactOwnershipDescriptor): { valid: boolean; error?: string } {
    if (descriptor.mode !== 'PROJECT_EXCLUSIVE') {
      return { valid: false, error: 'Ownership mode must be PROJECT_EXCLUSIVE' };
    }
    if (descriptor.aiosOwnershipAllowed !== false) {
      return { valid: false, error: 'AIOS ownership is explicitly forbidden under Principle 002' };
    }
    if (!descriptor.projectId) {
      return { valid: false, error: 'ProjectId must be specified' };
    }
    return { valid: true };
  }
}
