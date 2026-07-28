import { ReviewRule, ReviewContext } from '../ReviewRule';
import { ReviewViolation } from '../ReviewResult';
import { WorkspacePathAuditLogger } from '../../../projects/posting-map/src/shared/audit/WorkspacePathAuditLogger';
import * as path from 'path';

export class OwnershipRule implements ReviewRule {
  public readonly id = 'RULE-G6-01-OWNERSHIP';
  public readonly name = 'Asset Ownership & Responsibility Verification';
  public readonly category = 'Ownership' as const;

  public async evaluate(context: ReviewContext): Promise<ReviewViolation[]> {
    const violations: ReviewViolation[] = [];

    // Determine the task owner context based on the task title
    let taskOwner = 'AIOS'; // Default is AIOS Core Platform
    const titleLower = context.taskTitle.toLowerCase();
    
    if (titleLower.includes('posting map') || titleLower.includes('h アプリ') || titleLower.includes('k アプリ')) {
      taskOwner = 'POSTING MAP';
    } else if (titleLower.includes('hokusei') || titleLower.includes('北勢')) {
      taskOwner = 'Hokusei CH';
    }

    for (const file of context.proposedFiles) {
      const workspaceRoot = path.resolve(__dirname, '../../..');
      const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');

      // Determine file owner based on directory path
      let fileOwner = 'AIOS';
      if (relativePath.startsWith('projects/posting-map/')) {
        fileOwner = 'POSTING MAP';
      } else if (relativePath.startsWith('projects/hokusei-ch/')) {
        fileOwner = 'Hokusei CH';
      } else if (relativePath.startsWith('FIELD_OPERATIONS_PLATFORM/')) {
        fileOwner = 'AIOS';
      }

      // Check for ownership mismatch
      if (taskOwner !== fileOwner) {
        violations.push({
          ruleId: this.id,
          severity: 'ERROR',
          message: `Asset Ownership Mismatch: Task Target is "${taskOwner}", but proposed changes modify file owned by "${fileOwner}" ("${relativePath}").`,
          targetFile: file,
          remediation: `Ensure you only modify files that correspond to the task's owner context. If you are developing for ${taskOwner}, keep changes within its designated projects namespace.`
        });
      }

      // Enforcement: POSTING MAP Path Resolution Responsibility Ownership
      if (
        relativePath.startsWith('projects/posting-map/src/platform/') ||
        relativePath.startsWith('projects/posting-map/tests/integration/')
      ) {
        try {
          const fs = require('fs');
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf-8');
            if (
              (content.includes('FIELD_OPERATIONS_PLATFORM') || content.includes('03_BRANCH')) &&
              !content.includes('PostingMapPathResolver') &&
              !file.endsWith('PostingMapPathResolver.ts')
            ) {
              violations.push({
                ruleId: this.id,
                severity: 'ERROR',
                message: `Path Resolution Ownership Violation in "${relativePath}": Platform Runtimes and Integration Tests must delegate workspace path resolution to PostingMapPathResolver.`,
                targetFile: file,
                remediation: 'Import and use PostingMapPathResolver to resolve platform workspace paths.'
              });

              WorkspacePathAuditLogger.getInstance().logEvent({
                componentName: this.id,
                eventType: 'RULE_VIOLATION_DETECTED',
                targetPath: relativePath,
                violatedRuleId: this.id
              });
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
