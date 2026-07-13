import { EvolutionTarget, EvolutionStrategy } from './EvolutionEnums';

export interface EvolutionCandidate {
  candidateId: string;
  candidateVersion: string;
  knowledgeId: string;
  promotionId: string;
  
  targetComponent: string;
  target: EvolutionTarget;
  strategy: EvolutionStrategy;
  
  expectedBenefit: string;
  estimatedRisk: string;
  expectedQualityDelta: number;
  expectedPerformanceDelta: number;
  expectedRiskReduction: number;
  
  confidence: number;
  simulationScore?: number;
  approvalScore?: number;
  
  policyVersion: string;
  approvalPolicyVersion: string;
  
  sourceKnowledgeVersion: string;
  sourceLineageId: string;
  simulationReportId?: string;
  
  traceId: string;
  createdAt: Date;
}
