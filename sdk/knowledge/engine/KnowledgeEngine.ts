import { IKnowledgeEngine } from './IKnowledgeEngine';
import { KnowledgeDiscovery } from './KnowledgeDiscovery';
import { KnowledgeDataset } from '../contracts/KnowledgeDataset';
import { KnowledgeAsset, KnowledgeStatus } from '../contracts';
import * as crypto from 'crypto';

export class KnowledgeEngine implements IKnowledgeEngine {
  constructor(private readonly discovery: KnowledgeDiscovery) {}

  public async synthesize(dataset: KnowledgeDataset): Promise<ReadonlyArray<KnowledgeAsset>> {
    const pluginResults = this.discovery.synthesizeAll(dataset);
    const assets: KnowledgeAsset[] = [];

    for (const result of pluginResults) {
      // Deterministic temporary draft ID based on pattern IDs
      const hash = crypto.createHash('sha256')
        .update(result.sourcePatternIds.join(','))
        .digest('hex')
        .substring(0, 16);
      const knowledgeId = `KNW-DRAFT-${hash}`;

      assets.push(Object.freeze({
        schemaVersion: '1.0.0',
        knowledgeId,
        version: 0,
        status: KnowledgeStatus.DRAFT,
        semantic: result.semantic,
        logicalRules: result.logicalRules,
        metadata: {
          sourcePatternIds: result.sourcePatternIds,
          createdAt: dataset.metadata.generatedAt,
          generatedBy: result.pluginId,
          schemaVersion: '1.0.0'
        }
      }));
    }

    return Object.freeze(assets);
  }
}
