import * as fs from 'fs';
import { ReviewRule, ReviewContext } from '../ReviewRule';
import { ReviewViolation } from '../ReviewResult';
import { RootResolutionPolicy } from '../RootResolutionPolicy';

export class ProjectRootResolutionRule implements ReviewRule {
  public readonly id = 'RULE-ROOT-001';
  public readonly name = 'Relative Root Traversal Forbidden';
  public readonly category = 'Policy';

  public async evaluate(context: ReviewContext): Promise<ReviewViolation[]> {
    const violations: ReviewViolation[] = [];

    // 1. Audit implementation plan content
    const planViolation = RootResolutionPolicy.isPolicyViolated(context.planContent);
    if (planViolation.violated) {
      violations.push({
        ruleId: this.id,
        severity: 'ERROR',
        message: planViolation.reason,
        remediation: 'Remove relative parent folder traversal commands/descriptions and call RootResolver instead.'
      });
    }

    // 2. Audit the content of each modified file proposed in the plan
    for (const filePath of context.proposedFiles) {
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const fileViolation = RootResolutionPolicy.isPolicyViolated(fileContent);
          if (fileViolation.violated) {
            violations.push({
              ruleId: this.id,
              severity: 'ERROR',
              message: `File "${filePath}" violates root resolution policies: ${fileViolation.reason}`,
              targetFile: filePath,
              remediation: `Refactor paths in "${filePath}" to fetch directories from RootResolver.resolveWorkspace() or RootResolver.resolvePlatform().`
            });
          }
        } catch (err) {
          // Ignore un-readable files
        }
      }
    }

    return violations;
  }
}
