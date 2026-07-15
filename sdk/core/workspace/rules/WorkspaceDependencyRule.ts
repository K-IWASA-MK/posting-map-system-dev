import { WorkspaceManifest } from '../WorkspaceManifest';

export class WorkspaceDependencyRule {
  public validate(manifest: WorkspaceManifest): string[] {
    const violations: string[] = [];
    // Currently checks nothing specific, placeholder for e.g. circular dependency checks on manifest if it had dependencies array.
    return violations;
  }
}
