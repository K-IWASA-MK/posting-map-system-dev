/**
 * GovernanceAuditTrigger.ts
 * 
 * Master deterministic evaluation engine for Governance Audit Triggers.
 */

import { GovernanceImpactType } from './GovernanceImpactType';
import { GovernanceAuditReason, GovernanceAuditReasons } from './GovernanceAuditReason';
import { GovernanceAuditDecisions } from './GovernanceAuditDecision';
import { GovernanceImpactReport, GovernanceImpactReportBuilder } from './GovernanceImpactReport';

export interface ChangeSet {
  readonly impactTypes: readonly GovernanceImpactType[];
  readonly affectedModules?: readonly string[];
}

export class GovernanceAuditTrigger {
  public static evaluateImpact(changeSet: ChangeSet): GovernanceImpactReport {
    const impactTypes = changeSet.impactTypes.length > 0 ? changeSet.impactTypes : ['DOCUMENTATION_ONLY' as GovernanceImpactType];
    const affectedModules = changeSet.affectedModules || [];

    const reasons: GovernanceAuditReason[] = [];
    let requiresReaudit = false;

    for (const impact of impactTypes) {
      switch (impact) {
        case 'CONSTITUTION_CHANGE':
          reasons.push(GovernanceAuditReasons.CONSTITUTION_MODIFIED);
          requiresReaudit = true;
          break;
        case 'ENFORCEMENT_CHANGE':
          reasons.push(GovernanceAuditReasons.ENFORCEMENT_LOGIC_CHANGED);
          requiresReaudit = true;
          break;
        case 'RUNTIME_INTEGRATION_CHANGE':
          reasons.push(GovernanceAuditReasons.RUNTIME_BOUNDARY_CHANGED);
          requiresReaudit = true;
          break;
        case 'RETENTION_CATEGORY_CHANGE':
          reasons.push(GovernanceAuditReasons.RETENTION_MATRIX_MODIFIED);
          requiresReaudit = true;
          break;
        case 'MULTIPLE_GOVERNANCE_CHANGES':
          reasons.push(GovernanceAuditReasons.MULTIPLE_GOVERNANCE_CHANGES_DETECTED);
          requiresReaudit = true;
          break;
        case 'DOCUMENTATION_ONLY':
        case 'TEST_ONLY':
          if (!reasons.includes(GovernanceAuditReasons.NON_GOVERNANCE_CHANGE)) {
            reasons.push(GovernanceAuditReasons.NON_GOVERNANCE_CHANGE);
          }
          break;
      }
    }

    const uniqueGovernanceImpacts = impactTypes.filter(
      t => t !== 'DOCUMENTATION_ONLY' && t !== 'TEST_ONLY' && t !== 'MULTIPLE_GOVERNANCE_CHANGES'
    );

    if (uniqueGovernanceImpacts.length > 1 && !reasons.includes(GovernanceAuditReasons.MULTIPLE_GOVERNANCE_CHANGES_DETECTED)) {
      reasons.push(GovernanceAuditReasons.MULTIPLE_GOVERNANCE_CHANGES_DETECTED);
    }

    const decision = requiresReaudit
      ? GovernanceAuditDecisions.REQUIRES_REAUDIT
      : GovernanceAuditDecisions.NO_REAUDIT_REQUIRED;

    return GovernanceImpactReportBuilder.createReport(
      impactTypes,
      decision,
      reasons,
      affectedModules
    );
  }
}
