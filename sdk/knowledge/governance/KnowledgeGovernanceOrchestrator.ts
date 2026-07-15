import { IKnowledgeGovernanceOrchestrator } from './IKnowledgeGovernanceOrchestrator';
import { KnowledgeGovernanceRegistry } from './KnowledgeGovernanceRegistry';
import { IKnowledgeRepository } from '../repository/IKnowledgeRepository';
import { IKnowledgeSerialAllocator } from './IKnowledgeSerialAllocator';
import { KnowledgeAsset } from '../contracts';
import { KnowledgeGovernanceResult } from './KnowledgeGovernanceResult';
import { GovernanceDecision } from './GovernanceDecision';
import { KnowledgeBuilder } from './KnowledgeBuilder';

export class KnowledgeGovernanceOrchestrator implements IKnowledgeGovernanceOrchestrator {
  constructor(
    private readonly registry: KnowledgeGovernanceRegistry,
    private readonly repository: IKnowledgeRepository,
    private readonly allocator: IKnowledgeSerialAllocator
  ) {}

  public async evaluateAndStore(draftAssets: ReadonlyArray<KnowledgeAsset>): Promise<KnowledgeGovernanceResult> {
    const startTime = Date.now();
    const approvedAssets: KnowledgeAsset[] = [];
    const rejectedAssets: KnowledgeAsset[] = [];
    const decisions: GovernanceDecision[] = [];

    for (const draft of draftAssets) {
      const policy = this.registry.getPolicy(draft.metadata.generatedBy);

      if (!policy) {
        decisions.push(Object.freeze({
          decisionId: `DEC-K-NOPOLICY-${draft.knowledgeId}`,
          approved: false,
          reason: `No governance policy found for plugin ${draft.metadata.generatedBy}`,
          policyId: 'SYSTEM',
          ruleResults: [],
          ruleCount: 0,
          passedRuleCount: 0
        }));
        rejectedAssets.push(draft);
        continue;
      }

      const result = policy.evaluate(draft);
      decisions.push(result.decision);

      if (result.decision.approved && result.evaluation) {
        // Allocate next index using Serial Allocator (Blocker 5)
        const typePrefix = KnowledgeBuilder.getKnowledgeType(draft.metadata.generatedBy);
        const serialIndex = await this.allocator.allocate(typePrefix);

        // Build Approved Asset (serial + score assignment)
        const approvedAsset = KnowledgeBuilder.buildApproved(draft, result.decision, result.evaluation, serialIndex);
        approvedAssets.push(approvedAsset);

        // Store to repository directly
        await this.repository.save(approvedAsset);
      } else {
        rejectedAssets.push(draft);
      }
    }

    return Object.freeze({
      approvedAssets: Object.freeze(approvedAssets),
      rejectedAssets: Object.freeze(rejectedAssets),
      decisions: Object.freeze(decisions),
      approvedCount: approvedAssets.length,
      rejectedCount: rejectedAssets.length,
      durationMs: Date.now() - startTime
    });
  }
}
