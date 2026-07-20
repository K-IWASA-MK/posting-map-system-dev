import { ReviewRule, ReviewContext } from '../ReviewRule';
import { ReviewViolation } from '../ReviewResult';
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
        // The root FIELD_OPERATIONS_PLATFORM is owned by AIOS, but contains app data.
        // It has a mismatch since it resides outside projects/posting-map.
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
    }

    return violations;
  }
}
