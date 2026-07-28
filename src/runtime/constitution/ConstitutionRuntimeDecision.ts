/**
 * ConstitutionRuntimeDecision.ts
 * 
 * Immutable Runtime decision object returned by ConstitutionRuntimeGate.
 */

import { EnforcementResult } from '../../constitution/enforcement/EnforcementResult';

export type ConstitutionRuntimeAction = 'ACCEPT_SKILL' | 'REJECT_RETENTION' | 'RETURN_TO_PROJECT';

export interface ItemDecisionDetail {
  readonly itemIdentifier: string;
  readonly itemCategory: string;
  readonly action: ConstitutionRuntimeAction;
  readonly destination: 'AIOS_PLATFORM' | 'REQUESTING_PROJECT';
}

export interface ConstitutionRuntimeDecision {
  readonly projectId: string;
  readonly taskId: string;
  readonly passedGate: boolean;
  readonly aiosRetentionAllowed: boolean;
  readonly mandatoryProjectReturnEnforced: boolean;
  readonly itemDetails: readonly ItemDecisionDetail[];
  readonly enforcementResult: EnforcementResult;
  readonly evaluatedAt: string;
}
