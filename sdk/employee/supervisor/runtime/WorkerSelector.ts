/**
 * WorkerSelector.ts
 * 
 * Worker Selection Engine using configurable WorkerSelectionStrategy
 */

import { CandidateWorker, CapabilityFirstStrategy, WorkerSelectionStrategy } from './WorkerSelectionStrategy';
import { AssignmentEvaluation } from '../types/AssignmentEvaluation';

export interface SelectedWorkerResult {
  worker: CandidateWorker;
  evaluation: AssignmentEvaluation;
}

export class WorkerSelector {
  private strategy: WorkerSelectionStrategy;

  constructor(strategy?: WorkerSelectionStrategy) {
    this.strategy = strategy || new CapabilityFirstStrategy();
  }

  public setStrategy(strategy: WorkerSelectionStrategy): void {
    this.strategy = strategy;
  }

  public selectOptimalWorker(
    candidates: CandidateWorker[],
    requiredCapabilities: string[]
  ): SelectedWorkerResult | null {
    if (!candidates || candidates.length === 0) {
      return null;
    }

    let bestResult: SelectedWorkerResult | null = null;

    for (const candidate of candidates) {
      const evalResult = this.strategy.evaluate(candidate, requiredCapabilities);
      if (evalResult.matchScore === 0) {
        continue; // Exclude candidates with zero matching capabilities
      }

      if (!bestResult || evalResult.compositeScore > bestResult.evaluation.compositeScore) {
        bestResult = {
          worker: candidate,
          evaluation: evalResult
        };
      }
    }

    return bestResult;
  }
}
