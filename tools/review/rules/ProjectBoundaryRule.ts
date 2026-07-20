import { ReviewRule, ReviewContext } from '../ReviewRule';
import { ReviewViolation } from '../ReviewResult';
import * as path from 'path';

export class ProjectBoundaryRule implements ReviewRule {
  public readonly id = 'RULE-G6-01-PROJECT-BOUNDARY';
  public readonly name = 'Project Boundary Isolation';
  public readonly category = 'Boundary' as const;

  public async evaluate(context: ReviewContext): Promise<ReviewViolation[]> {
    const violations: ReviewViolation[] = [];

    // If it is an OS/SDK platform task (e.g., ASP-006), it is allowed to modify platform folders
    if (context.isPlatformTask) {
      return violations;
    }

    const platformPrefixes = [
      'kernel/',
      'sdk/',
      'tools/'
    ];

    for (const file of context.proposedFiles) {
      const workspaceRoot = path.resolve(__dirname, '../../..');
      const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');

      const isViolating = platformPrefixes.some(pref => relativePath.startsWith(pref));
      if (isViolating) {
        violations.push({
          ruleId: this.id,
          severity: 'ERROR',
          message: `Application task proposed modifications to platform core file: "${relativePath}". Only platform tasks (e.g. ASP-*) are authorized to modify kernel, sdk, or tools.`,
          targetFile: file,
          remediation: 'Remove platform core files from the Proposed Changes list, or make sure the task is designated as an OS Platform task (containing ASP-*).'
        });
      }
    }

    return violations;
  }
}
