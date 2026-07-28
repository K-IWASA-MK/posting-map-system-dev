/**
 * EnforcementDecision.ts
 * 
 * Defines the immutable enforcement decision outcome for a given item evaluated against Constitution v1.0.
 */

export type AIOSRetentionDecision = 'ACCEPT_AIOS_RETENTION' | 'REJECT_AIOS_RETENTION';
export type ProjectReturnDecision = 'MANDATORY_PROJECT_RETURN' | 'OPTIONAL_PROJECT_RETURN';

export interface EnforcementDecisionDescriptor {
  readonly itemCategory: string;
  readonly itemIdentifier: string;
  readonly aiosRetention: AIOSRetentionDecision;
  readonly projectReturn: ProjectReturnDecision;
  readonly primaryDestination: 'AIOS_PLATFORM' | 'REQUESTING_PROJECT';
  readonly decidedAt: string;
}

export class EnforcementDecision {
  public static acceptSkill(itemIdentifier: string): EnforcementDecisionDescriptor {
    return Object.freeze({
      itemCategory: 'SKILL',
      itemIdentifier,
      aiosRetention: 'ACCEPT_AIOS_RETENTION',
      projectReturn: 'OPTIONAL_PROJECT_RETURN',
      primaryDestination: 'AIOS_PLATFORM',
      decidedAt: new Date().toISOString()
    });
  }

  public static rejectProjectAsset(itemCategory: string, itemIdentifier: string): EnforcementDecisionDescriptor {
    return Object.freeze({
      itemCategory,
      itemIdentifier,
      aiosRetention: 'REJECT_AIOS_RETENTION',
      projectReturn: 'MANDATORY_PROJECT_RETURN',
      primaryDestination: 'REQUESTING_PROJECT',
      decidedAt: new Date().toISOString()
    });
  }
}
