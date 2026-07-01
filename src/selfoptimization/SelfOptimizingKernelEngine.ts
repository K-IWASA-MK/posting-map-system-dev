import { OptimizationVector, OptimizationCandidate, OptimizationDecision } from "./OptimizationVector";

export interface ISelfOptimizingKernelEngine {
  initialize(): Promise<boolean>;
  observe(context: Record<string, any>): Promise<OptimizationVector>;
  evaluate(vector: OptimizationVector): Promise<number>;
  generateCandidates(vector: OptimizationVector): Promise<OptimizationCandidate[]>;
  simulate(candidate: OptimizationCandidate): Promise<Record<string, any>>;
  select(candidates: OptimizationCandidate[]): Promise<OptimizationDecision>;
  feedback(decision: OptimizationDecision): Promise<boolean>;
}

export abstract class BaseSelfOptimizingKernelEngine implements ISelfOptimizingKernelEngine {
  abstract initialize(): Promise<boolean>;
  abstract observe(context: Record<string, any>): Promise<OptimizationVector>;
  abstract evaluate(vector: OptimizationVector): Promise<number>;
  abstract generateCandidates(vector: OptimizationVector): Promise<OptimizationCandidate[]>;
  abstract simulate(candidate: OptimizationCandidate): Promise<Record<string, any>>;
  abstract select(candidates: OptimizationCandidate[]): Promise<OptimizationDecision>;
  abstract feedback(decision: OptimizationDecision): Promise<boolean>;
}
