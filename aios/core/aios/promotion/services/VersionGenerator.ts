import { PromotionCandidate } from '../models/PromotionCandidate';
import { KnowledgeVersion } from '../models/KnowledgeVersion';

export class VersionGenerator {
  public generateVersion(candidate: PromotionCandidate): KnowledgeVersion {
    // Foundation Mock Version
    const versionNum = Math.floor(Math.random() * 10) + 1;
    const revision = `r${Math.floor(Math.random() * 1000)}`;
    return {
      version: `v${versionNum}.0.0`,
      revision: revision,
      hash: `hash-${candidate.candidateId}`,
      createdAt: new Date()
    };
  }
}
