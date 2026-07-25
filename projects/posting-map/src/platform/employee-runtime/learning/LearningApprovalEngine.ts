/**
 * AIOS Employee Learning Foundation
 * Learning Approval Engine Implementation
 */

import { ILearningApprovalEngine } from './contract/ILearningRegistry';
import { CandidateStatus, LearningRecord } from './models/EmployeeLearningModels';

export class LearningApprovalEngine implements ILearningApprovalEngine {
  public approveCandidate(
    learning: LearningRecord,
    authorizedByManager: boolean
  ): CandidateStatus {
    if (!authorizedByManager) {
      throw new Error(
        `[Learning Approval Block] Cannot approve Learning candidate '${learning.learningId}' without explicit manager authorization.`
      );
    }

    if (learning.status === 'REJECTED') {
      throw new Error(
        `[Learning Approval Block] Cannot transition Learning candidate '${learning.learningId}' from 'REJECTED' to 'APPROVED'. REJECTED is a terminal status.`
      );
    }

    return 'APPROVED';
  }

  public rejectCandidate(learning: LearningRecord): CandidateStatus {
    if (learning.status === 'APPROVED') {
      throw new Error(
        `[Learning Approval Block] Cannot reject Learning candidate '${learning.learningId}' that is already 'APPROVED'.`
      );
    }
    return 'REJECTED';
  }

  public validateUsageAllowed(learning: LearningRecord): { allowed: boolean; reason?: string } {
    if (learning.status !== 'APPROVED') {
      return {
        allowed: false,
        reason: `[Learning Usage Block] Learning candidate '${learning.learningId}' is not approved (Current Status: '${learning.status}'). Reference/Usage forbidden.`,
      };
    }
    return { allowed: true };
  }
}
