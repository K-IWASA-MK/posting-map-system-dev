export interface PromotionCandidate {
  candidateId: string;
  candidateVersion: string;
  proposalId: string;
  executionId: string;
  validationId: string;
  governanceId: string;
  sourceRuntime: string;
  
  targetKnowledge: string;
  knowledgeDomain: string;
  knowledgeCategory: string;
  knowledgePriority: string;
  expectedKnowledgeType: string;
  knowledgeTags: string[];
  
  score: number;
  qualityScore: number;
  severity: string;
  confidence: number;
  promotionConfidence: number;
  
  evidence: any;
  artifacts: string[];
  
  promotionReason: string;
  learningSource: string;
  knowledgeFingerprint: string;
  sourceCommit: string;
  sourceLedgerId: string;
  promotionSessionId: string;
  promotionPolicyVersion: string;
  
  knowledgeVersion: string;
  lineage: string[];
  
  traceId: string;
  createdAt: Date;
}
