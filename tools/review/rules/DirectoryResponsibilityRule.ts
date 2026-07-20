import { ReviewRule, ReviewContext } from '../ReviewRule';
import { ReviewViolation } from '../ReviewResult';
import * as path from 'path';

export class DirectoryResponsibilityRule implements ReviewRule {
  public readonly id = 'RULE-G6-01-DIR-RESPONSIBILITY';
  public readonly name = 'Directory Responsibility Enforcement';
  public readonly category = 'Responsibility' as const;

  public async evaluate(context: ReviewContext): Promise<ReviewViolation[]> {
    const violations: ReviewViolation[] = [];

    for (const file of context.proposedFiles) {
      const workspaceRoot = path.resolve(__dirname, '../../..');
      const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');

      // Reject files created inside the root FIELD_OPERATIONS_PLATFORM
      if (relativePath.startsWith('FIELD_OPERATIONS_PLATFORM/')) {
        violations.push({
          ruleId: this.id,
          severity: 'ERROR',
          message: `Application Data detected in AIOS Root: "${relativePath}". Writing business/application data directly to root is forbidden. All POSTING MAP operational data must reside under "projects/posting-map/FIELD_OPERATIONS_PLATFORM/".`,
          targetFile: file,
          remediation: 'Modify your path logic to point to "projects/posting-map/FIELD_OPERATIONS_PLATFORM" instead of root.'
        });
      }

      // Warn on new files directly at the workspace root
      const isDirectRoot = !relativePath.includes('/') && relativePath !== '' && !relativePath.startsWith('.');
      if (isDirectRoot && !relativePath.endsWith('.md') && !relativePath.endsWith('.json')) {
        violations.push({
          ruleId: this.id,
          severity: 'WARNING',
          message: `File created directly at workspace root: "${relativePath}". Root space should remain clean.`,
          targetFile: file,
          remediation: 'Move the file to projects/, tools/, or other appropriate subdirectories.'
        });
      }
    }

    return violations;
  }
}
