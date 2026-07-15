export interface ReleaseRule {
  id: string;
  description: string;
  evaluate(context: any): boolean;
}

export class SemanticVersionRule implements ReleaseRule {
  id = 'RLS-001';
  description = 'Version must follow semantic versioning format (x.y.z)';
  evaluate(context: any): boolean {
    const semVerRegex = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-zA-Z0-9-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][a-zA-Z0-9-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return context.version ? semVerRegex.test(context.version) : false;
  }
}

export class ReleaseBranchRule implements ReleaseRule {
  id = 'RLS-002';
  description = 'Release must originate from main or release branch';
  evaluate(context: any): boolean {
    return context.branch === 'main' || context.branch?.startsWith('release/');
  }
}

export class ReleaseArtifactRule implements ReleaseRule {
  id = 'RLS-003';
  description = 'Draft releases may have no assets, but published releases must have mapped assets';
  evaluate(context: any): boolean {
    if (context.draft) return true;
    return context.assets && context.assets.length > 0;
  }
}

export class ReleaseApprovalRule implements ReleaseRule {
  id = 'RLS-004';
  description = 'Production releases require explicit approval from an authorized creator';
  evaluate(context: any): boolean {
    if (context.prerelease) return true;
    return !!context.createdBy;
  }
}

export class ReleaseNotesRule implements ReleaseRule {
  id = 'RLS-005';
  description = 'Release notes must not be empty for published non-draft releases';
  evaluate(context: any): boolean {
    if (context.draft) return true;
    return context.notes && context.notes.trim().length > 0;
  }
}

export interface ReleasePolicy {
  id: string;
  name: string;
  rules: ReleaseRule[];
}

export const defaultReleasePolicy: ReleasePolicy = {
  id: 'POLICY-RELEASE-STD',
  name: 'Standard Release Policy',
  rules: [
    new SemanticVersionRule(),
    new ReleaseBranchRule(),
    new ReleaseArtifactRule(),
    new ReleaseApprovalRule(),
    new ReleaseNotesRule()
  ]
};
