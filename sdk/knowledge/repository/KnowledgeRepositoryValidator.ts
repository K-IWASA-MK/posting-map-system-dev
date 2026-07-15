import { KnowledgeAsset, KnowledgeStatus } from '../contracts';
import { GraphValidator } from '../engine/GraphValidator';

export class KnowledgeRepositoryValidator {
  public static validate(asset: KnowledgeAsset): void {
    // 1. Recursive Freeze check
    if (!Object.isFrozen(asset)) {
      throw new Error(`KnowledgeAsset ${asset.knowledgeId} must be frozen`);
    }
    if (!Object.isFrozen(asset.semantic)) {
      throw new Error(`KnowledgeAsset ${asset.knowledgeId}.semantic must be frozen`);
    }
    if (!Object.isFrozen(asset.metadata)) {
      throw new Error(`KnowledgeAsset ${asset.knowledgeId}.metadata must be frozen`);
    }
    if (!Object.isFrozen(asset.logicalRules)) {
      throw new Error(`KnowledgeAsset ${asset.knowledgeId}.logicalRules must be frozen`);
    }
    if (asset.evaluation && !Object.isFrozen(asset.evaluation)) {
      throw new Error(`KnowledgeAsset ${asset.knowledgeId}.evaluation must be frozen`);
    }

    // 2. Status & Version checks
    if (asset.status !== KnowledgeStatus.APPROVED) {
      throw new Error(`Rejected saving KnowledgeAsset ${asset.knowledgeId}: status must be APPROVED, got ${asset.status}`);
    }

    if (asset.version < 1) {
      throw new Error(`Rejected saving KnowledgeAsset ${asset.knowledgeId}: version must be >= 1 for APPROVED assets, got ${asset.version}`);
    }

    // 3. Evaluation check
    if (!asset.evaluation) {
      throw new Error(`Rejected saving KnowledgeAsset ${asset.knowledgeId}: missing evaluation data`);
    }

    // 4. Graph structure integrity check
    GraphValidator.validate(asset.semantic.nodes, asset.semantic.edges);
  }
}
