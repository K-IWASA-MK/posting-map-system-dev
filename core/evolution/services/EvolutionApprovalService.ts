import { EvolutionCandidate } from '../models/EvolutionCandidate';
import { EvolutionPlan } from '../models/EvolutionPlan';
import { ApprovalPolicy } from '../policy/EvolutionPolicy';

export class EvolutionApprovalService {
  constructor(private policy: ApprovalPolicy) {}

  approve(candidate: EvolutionCandidate, plan: EvolutionPlan): boolean {
    const score = candidate.approvalScore || 0;
    
    if (score < this.policy.rejectBelowScore) {
      return false; // Rejected
    }

    if (score < this.policy.requireManualReviewBelowScore) {
      // In Foundation, we mock manual review as auto-approve if it's borderline but above absolute reject
      return true; 
    }

    return true; // Auto approved
  }
}
