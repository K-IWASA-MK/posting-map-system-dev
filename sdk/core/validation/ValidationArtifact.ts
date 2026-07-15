export interface ValidationViolation {
  readonly id: string;
  readonly message: string;
  readonly file: string;
  readonly line?: number;
  readonly severity: 'ERROR' | 'WARNING' | 'INFO';
  readonly source: string;
}

export interface ValidationArtifact {
  readonly artifactId: string;
  readonly generatedBy: string;
  readonly data: Readonly<Record<string, unknown>>;
  readonly parentArtifactId?: string; // Links back to the previous artifact in the immutable chain
}

export class ValidationArtifactBuilder {
  public static createInitial(): ValidationArtifact {
    return Object.freeze({
      artifactId: 'initial',
      generatedBy: 'pipeline',
      data: Object.freeze({})
    });
  }

  public static createNext(parent: ValidationArtifact, generatedBy: string, newData: Record<string, unknown>): ValidationArtifact {
    return Object.freeze({
      artifactId: crypto.randomUUID(),
      generatedBy,
      data: Object.freeze({ ...parent.data, ...newData }), // Merges previous data with new data immutably
      parentArtifactId: parent.artifactId
    });
  }
}
