import { ReviewRule, ReviewContext } from '../ReviewRule';
import { ReviewViolation } from '../ReviewResult';
import { ArchitectureKnowledgeEngine } from '../ArchitectureKnowledgeEngine';

export class ArchitectureKnowledgeRule implements ReviewRule {
  public readonly id = 'RULE-G6-02-KNOWLEDGE-MATCH';
  public readonly name = 'Architecture Knowledge Base Patterns Verification';
  public readonly category = 'Policy' as const;

  public async evaluate(context: ReviewContext): Promise<ReviewViolation[]> {
    const violations: ReviewViolation[] = [];

    // Query matching patterns from the Knowledge Base
    const matches = ArchitectureKnowledgeEngine.query(context.proposedFiles, context.taskTitle);

    for (const m of matches) {
      const k = m.knowledge;
      
      violations.push({
        ruleId: `${this.id}-${k.id}`,
        severity: 'ERROR', // Known anti-pattern violations default to blocking errors
        message: `Matched past experience pattern: "${k.title}" (Confidence: ${(m.confidence * 100).toFixed(1)}%). Root Cause: ${k.rootCause}`,
        targetFile: context.proposedFiles.find(file => file.includes(k.pattern)),
        remediation: `Recommendation: ${k.fix} | Lesson Learned: ${k.lessonLearned} (Validation Status: ${k.validationStatus}, Confirmed: ${k.promotionCount} times)`
      });
    }

    return violations;
  }
}
