import { PromotionCandidate } from '../models/PromotionCandidate';
import { KnowledgeVersion } from '../models/KnowledgeVersion';
import { LineageGraph, LineageNode, LineageEdge } from '../models/LineageGraph';

export class LineageUpdater {
  public updateLineage(candidate: PromotionCandidate, version: KnowledgeVersion): LineageGraph {
    const node: LineageNode = {
      nodeId: `node-${version.hash}`,
      knowledgeId: candidate.targetKnowledge,
      version: version.version,
      fingerprint: candidate.knowledgeFingerprint,
      domain: candidate.knowledgeDomain,
      createdAt: new Date()
    };

    const edge: LineageEdge = {
      edgeId: `edge-${candidate.candidateId}`,
      fromNodeId: candidate.lineage[0] || 'genesis',
      toNodeId: node.nodeId,
      relationshipType: 'DERIVED_FROM',
      createdAt: new Date()
    };

    return {
      graphId: `graph-${candidate.targetKnowledge}`,
      nodes: [node],
      edges: [edge],
      updatedAt: new Date()
    };
  }
}
