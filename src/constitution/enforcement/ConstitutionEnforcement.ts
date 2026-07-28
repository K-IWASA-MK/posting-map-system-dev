/**
 * ConstitutionEnforcement.ts
 * 
 * Master Constitution Enforcement Engine for AIOS Platform Constitution v1.0.
 * Evaluates candidate registration items against the core rule:
 * - SKILL: ACCEPT_AIOS_RETENTION
 * - EVERYTHING ELSE: REJECT_AIOS_RETENTION & MANDATORY_PROJECT_RETURN
 */

import { EnforcementDecision, EnforcementDecisionDescriptor } from './EnforcementDecision';
import { ConstitutionViolation } from './ConstitutionViolation';
import { EnforcementResult, EnforcementResultBuilder } from './EnforcementResult';
import { SkillRetentionValidator } from './SkillRetentionValidator';
import { ProjectArtifactValidator } from './ProjectArtifactValidator';

export interface CandidateItem {
  readonly itemCategory: string;
  readonly itemIdentifier: string;
  readonly content?: string;
  readonly knownProjectIds?: string[];
}

export class ConstitutionEnforcement {
  public static evaluateItem(item: CandidateItem): {
    decision: EnforcementDecisionDescriptor;
    violations: ConstitutionViolation[];
  } {
    const violations: ConstitutionViolation[] = [];

    const skillCheck = SkillRetentionValidator.validateSkillRetention(item.itemCategory, item.itemIdentifier);

    if (skillCheck.isSkillOnly) {
      const decision = EnforcementDecision.acceptSkill(item.itemIdentifier);
      return { decision, violations };
    }

    // If not skill, it is REJECTED from AIOS and MANDATORY RETURN to Project
    if (skillCheck.violation) {
      violations.push(skillCheck.violation);
    }

    const projectCheck = ProjectArtifactValidator.validateProjectAsset(item.itemCategory, item.itemIdentifier);
    if (projectCheck.violation && !violations.some(v => v.itemCategory === item.itemCategory)) {
      violations.push(projectCheck.violation);
    }

    const decision = EnforcementDecision.rejectProjectAsset(item.itemCategory, item.itemIdentifier);

    return { decision, violations };
  }

  public static evaluateBatch(items: readonly CandidateItem[]): EnforcementResult {
    const decisions: EnforcementDecisionDescriptor[] = [];
    const allViolations: ConstitutionViolation[] = [];

    for (const item of items) {
      const { decision, violations } = ConstitutionEnforcement.evaluateItem(item);
      decisions.push(decision);
      allViolations.push(...violations);
    }

    return EnforcementResultBuilder.build(decisions, allViolations);
  }
}
