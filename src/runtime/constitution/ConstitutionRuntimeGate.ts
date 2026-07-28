/**
 * ConstitutionRuntimeGate.ts
 * 
 * Single Gateway connecting AIOS Runtime to Constitution Enforcement.
 * Delegates 100% of evaluation logic to ConstitutionEnforcement engine.
 * Pure, stateless, zero side effects on execution flow.
 */

import { ConstitutionEnforcement, CandidateItem } from '../../constitution/enforcement/ConstitutionEnforcement';
import { ConstitutionRuntimeContext } from './ConstitutionRuntimeContext';
import { ConstitutionRuntimeDecision, ItemDecisionDetail } from './ConstitutionRuntimeDecision';

export class ConstitutionRuntimeGate {
  public static evaluateRetention(context: ConstitutionRuntimeContext): ConstitutionRuntimeDecision {
    const enforcementResult = ConstitutionEnforcement.evaluateBatch(context.candidateItems);

    const itemDetails: ItemDecisionDetail[] = enforcementResult.decisions.map(d => {
      let action: 'ACCEPT_SKILL' | 'REJECT_RETENTION' | 'RETURN_TO_PROJECT';
      if (d.aiosRetention === 'ACCEPT_AIOS_RETENTION') {
        action = 'ACCEPT_SKILL';
      } else if (d.projectReturn === 'MANDATORY_PROJECT_RETURN') {
        action = 'RETURN_TO_PROJECT';
      } else {
        action = 'REJECT_RETENTION';
      }

      return Object.freeze({
        itemIdentifier: d.itemIdentifier,
        itemCategory: d.itemCategory,
        action,
        destination: d.primaryDestination
      });
    });

    const hasProjectReturn = itemDetails.some(i => i.action === 'RETURN_TO_PROJECT');

    return Object.freeze({
      projectId: context.projectId,
      taskId: context.taskId,
      passedGate: true,
      aiosRetentionAllowed: enforcementResult.allowedForAIOS,
      mandatoryProjectReturnEnforced: hasProjectReturn,
      itemDetails: Object.freeze(itemDetails),
      enforcementResult,
      evaluatedAt: new Date().toISOString()
    });
  }

  public static evaluateResultArtifacts(
    projectId: string,
    taskId: string,
    artifacts: { artifactId: string; artifactType?: string }[]
  ): ConstitutionRuntimeDecision {
    const candidateItems: CandidateItem[] = artifacts.map(art => ({
      itemCategory: art.artifactType || 'DOCUMENT',
      itemIdentifier: art.artifactId
    }));

    const context: ConstitutionRuntimeContext = Object.freeze({
      projectId,
      employeeId: 'supervisor-runtime',
      taskId,
      candidateItems: Object.freeze(candidateItems)
    });

    return ConstitutionRuntimeGate.evaluateRetention(context);
  }
}
