/**
 * GovernanceImpactReport.ts
 * 
 * Immutable report model containing impact details, decision, and reasons.
 */

import { GovernanceImpactType } from './GovernanceImpactType';
import { GovernanceAuditReason } from './GovernanceAuditReason';
import { GovernanceAuditDecision } from './GovernanceAuditDecision';

export interface GovernanceImpactReport {
  readonly impactTypes: readonly GovernanceImpactType[];
  readonly primaryImpactType: GovernanceImpactType;
  readonly decision: GovernanceAuditDecision;
  readonly reasons: readonly GovernanceAuditReason[];
  readonly affectedModules: readonly string[];
  readonly generatedAt: string;
}

export class GovernanceImpactReportBuilder {
  public static createReport(
    impactTypes: readonly GovernanceImpactType[],
    decision: GovernanceAuditDecision,
    reasons: readonly GovernanceAuditReason[],
    affectedModules: readonly string[]
  ): GovernanceImpactReport {
    const uniqueImpactTypes = Array.from(new Set(impactTypes));
    const isMultiple = uniqueImpactTypes.filter(t => t !== 'DOCUMENTATION_ONLY' && t !== 'TEST_ONLY').length > 1;
    
    let finalImpactTypes = uniqueImpactTypes;
    let primaryImpactType: GovernanceImpactType;

    if (isMultiple) {
      if (!finalImpactTypes.includes('MULTIPLE_GOVERNANCE_CHANGES')) {
        finalImpactTypes = [...finalImpactTypes, 'MULTIPLE_GOVERNANCE_CHANGES'];
      }
      primaryImpactType = 'MULTIPLE_GOVERNANCE_CHANGES';
    } else {
      primaryImpactType = uniqueImpactTypes[0] || 'DOCUMENTATION_ONLY';
    }

    return Object.freeze({
      impactTypes: Object.freeze([...finalImpactTypes]),
      primaryImpactType,
      decision,
      reasons: Object.freeze([...reasons]),
      affectedModules: Object.freeze([...affectedModules]),
      generatedAt: new Date().toISOString()
    });
  }
}
