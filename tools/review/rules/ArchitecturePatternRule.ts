import { ReviewRule, ReviewContext } from '../ReviewRule';
import { ReviewViolation } from '../ReviewResult';
import { ArchitecturePatternEngine } from '../ArchitecturePatternEngine';

export class ArchitecturePatternRule implements ReviewRule {
  public readonly id = 'RULE-G6-03-PATTERN-MATCH';
  public readonly name = 'Architecture Pattern Base Verification';
  public readonly category = 'Boundary' as const;

  public async evaluate(context: ReviewContext): Promise<ReviewViolation[]> {
    const violations: ReviewViolation[] = [];

    // Query matching patterns from the Pattern Engine
    const matches = ArchitecturePatternEngine.query(context.proposedFiles);

    for (const m of matches) {
      const p = m.pattern;
      
      // Build structured recommendations list
      const recs = p.recommendations.map(r => {
        let text = `- Action: ${r.action}`;
        if (r.referenceKnowledgeId) text += ` (Reference Knowledge: ${r.referenceKnowledgeId})`;
        if (r.docLink) text += ` (Docs: ${r.docLink})`;
        return text;
      }).join('\n');

      violations.push({
        ruleId: `${this.id}-${p.id}`,
        severity: 'ERROR',
        message: `Design matches known Anti-Pattern: "${p.name}" (Confidence: ${(m.confidence * 100).toFixed(1)}%). Description: ${p.description}`,
        targetFile: context.proposedFiles[0],
        remediation: `Maturity Status: ${p.stability} | Derived from: [${p.derivedFrom.join(', ')}]\nRecommendations:\n${recs}`
      });
    }

    return violations;
  }
}
