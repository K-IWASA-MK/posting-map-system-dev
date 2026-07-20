import { ReviewRole } from './ReviewRole';
import { ReviewContext, ReviewRule } from './ReviewRule';
import { AgentReviewResult } from './AgentReviewResult';
import { ReviewViolation } from './ReviewResult';

export abstract class ReviewAgent {
  public abstract readonly id: string;
  public abstract readonly role: ReviewRole;
  public abstract readonly capabilities: string[];

  /**
   * Evaluates the review context based on the agent's specific capabilities.
   */
  public abstract review(context: ReviewContext): Promise<AgentReviewResult>;

  protected calculateScoreAndDecision(violations: ReviewViolation[]): { score: number; decision: AgentReviewResult['decision'] } {
    let score = 100;
    let hasError = false;

    for (const v of violations) {
      if (v.severity === 'ERROR') {
        score -= 20;
        hasError = true;
      } else {
        score -= 5;
      }
    }
    score = Math.max(0, score);

    const decision = hasError ? 'FAILED' : (score < 80 ? 'WARNING' : 'PASS');
    return { score, decision };
  }
}

// 1. Architecture Agent Implementation
export class ArchitectureAgent extends ReviewAgent {
  public readonly id = 'agent-architecture';
  public readonly role = 'ARCHITECTURE' as const;
  public readonly capabilities = ['Boundary', 'Ownership', 'Pattern', 'Knowledge'];

  public async review(context: ReviewContext): Promise<AgentReviewResult> {
    const violations: ReviewViolation[] = [];
    
    // Dynamically load only rules that match capabilities/category
    const { ProjectBoundaryRule } = require('./rules/ProjectBoundaryRule');
    const { OwnershipRule } = require('./rules/OwnershipRule');
    const { ArchitectureKnowledgeRule } = require('./rules/ArchitectureKnowledgeRule');
    const { ArchitecturePatternRule } = require('./rules/ArchitecturePatternRule');

    const rules: ReviewRule[] = [
      new ProjectBoundaryRule(),
      new OwnershipRule(),
      new ArchitectureKnowledgeRule(),
      new ArchitecturePatternRule()
    ];

    for (const r of rules) {
      const v = await r.evaluate(context);
      violations.push(...v);
    }

    const { score, decision } = this.calculateScoreAndDecision(violations);
    return {
      agentId: this.id,
      role: this.role,
      decision,
      score,
      violations,
      recommendations: violations.map(v => v.remediation || '')
    };
  }
}

// 2. Governance Agent Implementation
export class GovernanceAgent extends ReviewAgent {
  public readonly id = 'agent-governance';
  public readonly role = 'GOVERNANCE' as const;
  public readonly capabilities = ['Responsibility', 'Policy'];

  public async review(context: ReviewContext): Promise<AgentReviewResult> {
    const violations: ReviewViolation[] = [];

    const { DirectoryResponsibilityRule } = require('./rules/DirectoryResponsibilityRule');
    const { ArchitecturePolicyRule } = require('./rules/ArchitecturePolicyRule');

    const rules: ReviewRule[] = [
      new DirectoryResponsibilityRule(),
      new ArchitecturePolicyRule()
    ];

    for (const r of rules) {
      const v = await r.evaluate(context);
      violations.push(...v);
    }

    const { score, decision } = this.calculateScoreAndDecision(violations);
    return {
      agentId: this.id,
      role: this.role,
      decision,
      score,
      violations,
      recommendations: violations.map(v => v.remediation || '')
    };
  }
}

// 3. Security Agent Implementation (VETO Power)
export class SecurityAgent extends ReviewAgent {
  public readonly id = 'agent-security';
  public readonly role = 'SECURITY' as const;
  public readonly capabilities = ['Secret', 'Sandbox', 'Trust'];

  public async review(context: ReviewContext): Promise<AgentReviewResult> {
    const violations: ReviewViolation[] = [];
    const contentLower = context.planContent.toLowerCase();

    // Check for hardcoded credentials/secrets in the plan description
    const hasSecretPattern = 
      contentLower.includes('password') || 
      contentLower.includes('secret_key') || 
      contentLower.includes('api_key') || 
      contentLower.includes('private_key');

    let decision: AgentReviewResult['decision'] = 'PASS';
    let score = 100;

    if (hasSecretPattern) {
      score = 0;
      decision = 'VETO';
      violations.push({
        ruleId: 'RULE-G6-04-SECURITY-VETO',
        severity: 'ERROR',
        message: 'Security Audit: Potential hardcoded secret or plain-text credential keyword detected in implementation plan.',
        remediation: 'Remove plain-text keys, passwords, or credential keywords from your implementation plan.'
      });
    }

    return {
      agentId: this.id,
      role: this.role,
      decision,
      score,
      violations,
      recommendations: violations.map(v => v.remediation || '')
    };
  }
}

// 4. Performance Agent Implementation
export class PerformanceAgent extends ReviewAgent {
  public readonly id = 'agent-performance';
  public readonly role = 'PERFORMANCE' as const;
  public readonly capabilities = ['Runtime', 'Complexity', 'Cost'];

  public async review(context: ReviewContext): Promise<AgentReviewResult> {
    const violations: ReviewViolation[] = [];
    const contentLower = context.planContent.toLowerCase();

    let decision: AgentReviewResult['decision'] = 'PASS';
    let score = 100;

    // Warning on nested loops or high complexity indications
    if (contentLower.includes('nested loop') || contentLower.includes('complexity O(')) {
      score = 75;
      decision = 'WARNING';
      violations.push({
        ruleId: 'RULE-G6-04-PERF-COMPLEXITY',
        severity: 'WARNING',
        message: 'Performance Audit: Proposing high-complexity algorithms or nested loops.',
        remediation: 'Verify if complexity can be reduced, or document justifications.'
      });
    }

    return {
      agentId: this.id,
      role: this.role,
      decision,
      score,
      violations,
      recommendations: violations.map(v => v.remediation || '')
    };
  }
}

// 5. Quality Agent Implementation
export class QualityAgent extends ReviewAgent {
  public readonly id = 'agent-quality';
  public readonly role = 'QUALITY' as const;
  public readonly capabilities = ['Score', 'Maintainability', 'Readability'];

  public async review(context: ReviewContext): Promise<AgentReviewResult> {
    const violations: ReviewViolation[] = [];
    const planLength = context.planContent.length;

    let decision: AgentReviewResult['decision'] = 'PASS';
    let score = 100;

    // Plan descriptions that are too brief are flagged for quality
    if (planLength < 150) {
      score = 70;
      decision = 'WARNING';
      violations.push({
        ruleId: 'RULE-G6-04-QUAL-BREVITY',
        severity: 'WARNING',
        message: 'Quality Audit: The implementation plan is extremely brief, which reduces context clarity.',
        remediation: 'Provide a more detailed description of the proposed changes and verification plan.'
      });
    }

    return {
      agentId: this.id,
      role: this.role,
      decision,
      score,
      violations,
      recommendations: violations.map(v => v.remediation || '')
    };
  }
}
