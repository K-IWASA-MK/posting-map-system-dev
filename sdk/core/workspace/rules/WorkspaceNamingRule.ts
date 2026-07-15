import { WorkspaceManifest } from '../WorkspaceManifest';

export class WorkspaceNamingRule {
  public validate(manifest: WorkspaceManifest): string[] {
    const violations: string[] = [];
    if (!manifest.workspaceName || manifest.workspaceName.trim() === '') {
      violations.push('Workspace name must not be empty.');
    }
    if (!/^[a-z0-9-]+$/.test(manifest.workspaceName)) {
      violations.push('Workspace name must contain only lowercase letters, numbers, and hyphens.');
    }
    return violations;
  }
}
