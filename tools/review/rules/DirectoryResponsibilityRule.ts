import { ReviewRule, ReviewContext } from '../ReviewRule';
import { ReviewViolation } from '../ReviewResult';
import { WorkspacePathAuditLogger } from '../../../projects/posting-map/src/shared/audit/WorkspacePathAuditLogger';
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

        WorkspacePathAuditLogger.getInstance().logEvent({
          componentName: this.id,
          eventType: 'RULE_VIOLATION_DETECTED',
          targetPath: relativePath,
          violatedRuleId: this.id
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

      // Reject direct path construction of FIELD_OPERATIONS_PLATFORM or 03_BRANCH in TypeScript files
      if (
        file.endsWith('.ts') &&
        !file.endsWith('PostingMapPathResolver.ts') &&
        !file.endsWith('test_posting_map_path_resolver.ts') &&
        !file.endsWith('test_workspace_path_guard.ts') &&
        !file.endsWith('test_workspace_path_audit.ts') &&
        !file.endsWith('RootResolver.ts') &&
        !file.endsWith('WorkspacePathValidator.ts')
      ) {
        try {
          const fs = require('fs');
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf-8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const cleanLine = line.replace(/\/\/.*/, '').replace(/\/\*.*?\*\//, '');
              const containsFieldOps = cleanLine.includes('"FIELD_OPERATIONS_PLATFORM"') || cleanLine.includes("'FIELD_OPERATIONS_PLATFORM'");
              const containsBranch = cleanLine.includes('"03_BRANCH"') || cleanLine.includes("'03_BRANCH'");
              const containsPathJoin = cleanLine.includes('path.join') || cleanLine.includes('fs.mkdirSync');

              if (containsPathJoin && (containsFieldOps || containsBranch)) {
                violations.push({
                  ruleId: this.id,
                  severity: 'ERROR',
                  message: `Direct construction of FIELD_OPERATIONS_PLATFORM or 03_BRANCH path in "${relativePath}:${i + 1}". Workspace paths must use PostingMapPathResolver (SSOT).`,
                  targetFile: file,
                  remediation: 'Refactor code to use PostingMapPathResolver instead of constructing paths manually.'
                });

                WorkspacePathAuditLogger.getInstance().logEvent({
                  componentName: this.id,
                  eventType: 'RULE_VIOLATION_DETECTED',
                  targetPath: `${relativePath}:${i + 1}`,
                  violatedRuleId: this.id
                });
              }
            }
          }
        } catch {
          // Ignore read errors
        }
      }
    }

    return violations;
  }
}
