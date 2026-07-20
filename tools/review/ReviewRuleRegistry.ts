import { ReviewRule } from './ReviewRule';

export class ReviewRuleRegistry {
  private static readonly rules = new Map<string, ReviewRule>();

  public static register(rule: ReviewRule): void {
    this.rules.set(rule.id, rule);
  }

  public static unregister(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  public static getRules(): ReviewRule[] {
    return Array.from(this.rules.values());
  }

  public static clear(): void {
    this.rules.clear();
  }

  /**
   * Discovers and registers all built-in architecture validation rules.
   */
  public static discover(): void {
    // Clear existing rules to prevent double registration
    this.clear();

    const { ProjectBoundaryRule } = require('./rules/ProjectBoundaryRule');
    const { DirectoryResponsibilityRule } = require('./rules/DirectoryResponsibilityRule');
    const { OwnershipRule } = require('./rules/OwnershipRule');
    const { ArchitecturePolicyRule } = require('./rules/ArchitecturePolicyRule');
    const { ArchitectureKnowledgeRule } = require('./rules/ArchitectureKnowledgeRule');
    const { ArchitecturePatternRule } = require('./rules/ArchitecturePatternRule');
    const { ProjectRootResolutionRule } = require('./rules/ProjectRootResolutionRule');

    this.register(new ProjectBoundaryRule());
    this.register(new DirectoryResponsibilityRule());
    this.register(new OwnershipRule());
    this.register(new ArchitecturePolicyRule());
    this.register(new ArchitectureKnowledgeRule());
    this.register(new ArchitecturePatternRule());
    this.register(new ProjectRootResolutionRule());

    // 2. Load dynamic promoted rules
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.resolve(__dirname, 'promoted_rules.json');
    if (fs.existsSync(dbPath)) {
      try {
        const promoted = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        for (const data of promoted) {
          this.register(new PromotedDynamicRule(data));
        }
      } catch (err) {
        console.error(`[ReviewRuleRegistry] Failed to load promoted rules: ${err}`);
      }
    }
  }
}

class PromotedDynamicRule implements ReviewRule {
  public readonly id: string;
  public readonly name: string;
  public readonly category: 'Boundary' | 'Ownership' | 'Responsibility' | 'Dependency' | 'Security';
  private readonly triggerConditions: string[];

  constructor(data: any) {
    this.id = data.id;
    this.name = data.title;
    this.category = data.category;
    this.triggerConditions = data.triggerConditions;
  }

  public async evaluate(context: import('./ReviewRule').ReviewContext): Promise<import('./ReviewResult').ReviewViolation[]> {
    const violations: import('./ReviewResult').ReviewViolation[] = [];
    const path = require('path');
    const workspaceRoot = path.resolve(__dirname, '../..');

    for (const file of context.proposedFiles) {
      const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');
      const isAtRoot = !relativePath.includes('/');
      const ext = path.extname(file);

      let conditionsSatisfied = true;
      for (const cond of this.triggerConditions) {
        let matchedCondition = false;
        if (cond.startsWith('path-starts:')) {
          const prefix = cond.substring(12);
          if (relativePath.startsWith(prefix)) matchedCondition = true;
        } else if (cond.startsWith('root-file:')) {
          const glob = cond.substring(10);
          if (isAtRoot) {
            if (glob === '*' || (glob.startsWith('*.') && ext === glob.substring(1)) || relativePath === glob) {
              matchedCondition = true;
            }
          }
        } else if (cond === 'project-escape') {
          if (!relativePath.startsWith('projects/') && !relativePath.startsWith('sdk/') && !relativePath.startsWith('kernel/') && !relativePath.startsWith('tools/')) {
            matchedCondition = true;
          }
        }

        if (!matchedCondition) {
          conditionsSatisfied = false;
          break;
        }
      }

      if (conditionsSatisfied && this.triggerConditions.length > 0) {
        violations.push({
          ruleId: this.id,
          severity: 'ERROR',
          message: `Evolved Rule Violation: File matching dynamic pattern "${this.id}" detected.`,
          targetFile: file,
          remediation: `Evolved rule. Rationale: ${this.id}. Make sure files comply with application boundaries.`
        });
      }
    }

    return violations;
  }
}
