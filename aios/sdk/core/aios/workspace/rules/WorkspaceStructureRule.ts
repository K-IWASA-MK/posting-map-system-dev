import { WorkspaceManifest } from '../WorkspaceManifest';

export class WorkspaceStructureRule {
  public validate(manifest: WorkspaceManifest): string[] {
    const violations: string[] = [];
    if (!manifest.rootDirectory) {
      violations.push('Workspace rootDirectory must be defined.');
    }
    return violations;
  }
}
