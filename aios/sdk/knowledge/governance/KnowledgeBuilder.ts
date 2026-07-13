import { KnowledgeAsset, KnowledgeStatus, KnowledgeEvaluation, KnowledgeId } from '../contracts';
import { GovernanceDecision } from './GovernanceDecision';

export class KnowledgeBuilder {
  // Map plugin IDs to knowledge type prefixes
  private static readonly PLUGIN_TYPE_MAP: Record<string, string> = {
    'aios.knowledge.plugin.sequence': 'SEQ'
  };

  public static getKnowledgeType(pluginId: string): string {
    const type = this.PLUGIN_TYPE_MAP[pluginId];
    if (!type) {
      throw new Error(`Unknown pluginId for KnowledgeType mapping: ${pluginId}`);
    }
    return type;
  }

  public static buildApproved(
    draft: KnowledgeAsset,
    decision: GovernanceDecision,
    evaluation: KnowledgeEvaluation,
    serialIndex: number
  ): KnowledgeAsset {
    if (draft.status !== KnowledgeStatus.DRAFT) {
      throw new Error(`Cannot build APPROVED asset from status ${draft.status}. Must be DRAFT.`);
    }

    if (!decision.approved) {
      throw new Error("Cannot build APPROVED asset with a REJECTED decision");
    }

    // Generate formal sequential ID using Value Object
    const typePrefix = this.getKnowledgeType(draft.metadata.generatedBy);
    const knowledgeId = KnowledgeId.generate(typePrefix, serialIndex);

    const approvedAsset: KnowledgeAsset = {
      schemaVersion: draft.schemaVersion,
      knowledgeId,
      version: 1, // DRAFT (0) -> APPROVED (1)
      status: KnowledgeStatus.APPROVED,
      semantic: draft.semantic,
      logicalRules: draft.logicalRules,
      metadata: Object.freeze({
        ...draft.metadata,
        createdAt: draft.metadata.createdAt // Retain original creation timestamp deterministically
      }),
      evaluation: Object.freeze(evaluation)
    };

    return Object.freeze(approvedAsset);
  }
}
