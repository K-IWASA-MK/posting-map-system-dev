/**
 * ProjectArtifactValidator.ts
 * 
 * Validates Project Artifacts, Source Code, Documents, Database, Runtime State, Configurations, etc.
 * Enforces Principle 002 (Project Ownership) & Principle 004 (No Artifact Retention).
 * Dictates MANDATORY_PROJECT_RETURN and REJECT_AIOS_RETENTION for all non-Skill items.
 */

import { ConstitutionViolation, ConstitutionViolationFactory } from './ConstitutionViolation';

export type RecognizedProjectCategory =
  | 'SOURCE_CODE'
  | 'DOCUMENTS'
  | 'DATABASE'
  | 'RUNTIME_STATE'
  | 'CONFIGURATION'
  | 'GENERATED_FILES'
  | 'IMAGES'
  | 'PROJECT_LOGS'
  | 'PROJECT_FILES'
  | 'PROJECT_SECRETS'
  | 'EVERYTHING_ELSE';

export class ProjectArtifactValidator {
  public static isProjectAsset(itemCategory: string): boolean {
    const norm = itemCategory.trim().toUpperCase();
    return norm !== 'SKILL';
  }

  public static validateProjectAsset(
    itemCategory: string,
    itemIdentifier: string
  ): { isProjectAsset: boolean; violation: ConstitutionViolation } {
    const violation = ConstitutionViolationFactory.createViolation(
      'RULE_OWNERSHIP_001',
      'PRIN_002',
      itemCategory,
      itemIdentifier,
      `Item category '${itemCategory}' belongs strictly to the Requesting Project. AIOS retention is REJECTED and MANDATORY return to Project is enforced.`
    );

    return {
      isProjectAsset: true,
      violation
    };
  }
}
