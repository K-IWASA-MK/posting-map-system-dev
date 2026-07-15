import { EvolutionTarget, EvolutionStrategy } from './EvolutionEnums';

export interface EvolutionPlan {
  planId: string;
  target: EvolutionTarget;
  strategy: EvolutionStrategy;
  
  steps: string[];
  executionStrategy: string;
  fallbackStrategy: string;
  rollbackPlan: string;
  simulationPlan: string;
  monitoringPlan: string;
  
  approvalPolicy: string;
  validationCriteria: string;
  rollbackCriteria: string;
  requiredCapabilities: string[];
  
  expectedOutcome: string;
  successCriteria: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
