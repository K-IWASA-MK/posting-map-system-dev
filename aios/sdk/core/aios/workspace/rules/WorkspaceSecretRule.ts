import { WorkspaceManifest } from '../WorkspaceManifest';

export class WorkspaceSecretRule {
  public validate(manifest: WorkspaceManifest): string[] {
    const violations: string[] = [];
    // Static check for secrets in manifest fields
    const json = JSON.stringify(manifest).toLowerCase();
    if (json.includes('password') || json.includes('secret') || json.includes('token') || json.includes('key')) {
      violations.push('Potential secret found in Workspace manifest fields. Do not store secrets in manifest.');
    }
    return violations;
  }
}
