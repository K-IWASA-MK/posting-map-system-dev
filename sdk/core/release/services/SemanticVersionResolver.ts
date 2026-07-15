export interface ISemanticVersionResolver {
  resolveNextVersion(repositoryId: string, currentVersion?: string): Promise<string>;
}

export class SemanticVersionResolver implements ISemanticVersionResolver {
  public async resolveNextVersion(repositoryId: string, currentVersion?: string): Promise<string> {
    if (!currentVersion) return 'v0.1.0';
    // Dummy logic: just bump patch version for now
    const parts = currentVersion.replace('v', '').split('.');
    if (parts.length === 3) {
      return `v${parts[0]}.${parts[1]}.${parseInt(parts[2]) + 1}`;
    }
    return 'v0.1.0';
  }
}
