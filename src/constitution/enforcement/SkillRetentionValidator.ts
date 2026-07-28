/**
 * SkillRetentionValidator.ts
 * 
 * Strict Validator for Principle 003 (Knowledge Boundary Principle) & Principle 004 (No Artifact Retention Principle).
 * Enforces that AIOS Retention is STRICTLY LIMITED TO SKILL ONLY.
 */

import { ConstitutionViolation, ConstitutionViolationFactory } from './ConstitutionViolation';

export class SkillRetentionValidator {
  public static readonly ALLOWED_AIOS_CATEGORY = 'SKILL';

  public static isSkillCategory(category: string): boolean {
    return category.trim().toUpperCase() === SkillRetentionValidator.ALLOWED_AIOS_CATEGORY;
  }

  public static validateSkillRetention(
    itemCategory: string,
    itemIdentifier: string
  ): { isSkillOnly: boolean; violation?: ConstitutionViolation } {
    if (SkillRetentionValidator.isSkillCategory(itemCategory)) {
      return { isSkillOnly: true };
    }

    const violation = ConstitutionViolationFactory.createViolation(
      'RULE_BOUNDARY_001',
      'PRIN_003',
      itemCategory,
      itemIdentifier,
      `AIOS Platform Retention is strictly limited to SKILL type only. Category '${itemCategory}' is forbidden from AIOS platform retention.`
    );

    return { isSkillOnly: false, violation };
  }
}
