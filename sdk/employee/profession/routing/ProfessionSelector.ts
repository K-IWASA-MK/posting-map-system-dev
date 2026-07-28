/**
 * ProfessionSelector.ts
 * 
 * Supervisor Candidate Worker Selector based on Profession, Mission, Domain, and Skill Profile
 */

import { CandidateWorker } from '../../supervisor/runtime/WorkerSelectionStrategy';
import { ProfessionEvaluationCriteria, ProfessionResolver } from '../assignment/ProfessionResolver';
import { ProfessionRoutingPolicy, RoutingWeights } from './ProfessionRoutingPolicy';
import { AssignmentEvaluation } from '../../supervisor/types/AssignmentEvaluation';

export interface SelectedProfessionWorkerResult {
  worker: CandidateWorker;
  evaluation: AssignmentEvaluation;
}

export class ProfessionSelector {
  private policy: ProfessionRoutingPolicy;

  constructor(weights?: RoutingWeights) {
    this.policy = new ProfessionRoutingPolicy(weights);
  }

  public selectOptimalWorker(
    candidates: CandidateWorker[],
    criteria: ProfessionEvaluationCriteria
  ): SelectedProfessionWorkerResult | null {
    if (!candidates || candidates.length === 0) {
      return null;
    }

    const weights = this.policy.getWeights();
    let bestResult: SelectedProfessionWorkerResult | null = null;

    for (const candidate of candidates) {
      const pAssignment = candidate.profile.professionAssignment;
      const matchResult = ProfessionResolver.evaluateMatch(pAssignment, criteria);

      const availabilityScore = candidate.status.load < 1.0 ? 1.0 - candidate.status.load : 0.0;
      const compositeScore =
        matchResult.missionScore * weights.missionWeight +
        matchResult.domainScore * weights.domainWeight +
        matchResult.skillScore * weights.skillWeight +
        availabilityScore * weights.loadWeight;

      const evaluation: AssignmentEvaluation = {
        matchScore: matchResult.compositeScore,
        permissionScore: candidate.profile.permissions.length > 0 ? 1.0 : 0.5,
        availabilityScore,
        compositeScore,
        reason: `ProfessionSelector: mission=${matchResult.missionScore.toFixed(2)}, domain=${matchResult.domainScore.toFixed(2)}, skill=${matchResult.skillScore.toFixed(2)}`
      };

      if (!bestResult || evaluation.compositeScore > bestResult.evaluation.compositeScore) {
        bestResult = {
          worker: candidate,
          evaluation
        };
      }
    }

    return bestResult;
  }
}
