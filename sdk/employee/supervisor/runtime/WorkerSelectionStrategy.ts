/**
 * WorkerSelectionStrategy.ts
 * 
 * Strategy Pattern interfaces and implementations for Worker Selection
 */

import { EmployeeProfile } from '../../provisioning/types/EmployeeProfile';
import { EmployeeStatus } from '../../provisioning/types/EmployeeStatus';
import { AssignmentEvaluation } from '../types/AssignmentEvaluation';
import { CapabilityResolver } from '../../capability/CapabilityResolver';

export interface CandidateWorker {
  profile: EmployeeProfile;
  status: EmployeeStatus;
}

export interface WorkerSelectionStrategy {
  evaluate(candidate: CandidateWorker, requiredCapabilities: string[]): AssignmentEvaluation;
}

export class CapabilityFirstStrategy implements WorkerSelectionStrategy {
  evaluate(candidate: CandidateWorker, requiredCapabilities: string[]): AssignmentEvaluation {
    const matchScore = CapabilityResolver.calculateMatchScore(candidate.profile.capabilities, requiredCapabilities);
    const availabilityScore = candidate.status.load < 1.0 ? 1.0 - candidate.status.load : 0.0;
    const permissionScore = candidate.profile.permissions.length > 0 ? 1.0 : 0.5;
    
    // Weight capability highest
    const compositeScore = matchScore * 0.6 + availabilityScore * 0.3 + permissionScore * 0.1;

    return {
      matchScore,
      permissionScore,
      availabilityScore,
      compositeScore,
      reason: `CapabilityFirstStrategy: match=${matchScore.toFixed(2)}, avail=${availabilityScore.toFixed(2)}`
    };
  }
}

export class LoadBalancedStrategy implements WorkerSelectionStrategy {
  evaluate(candidate: CandidateWorker, requiredCapabilities: string[]): AssignmentEvaluation {
    const matchScore = CapabilityResolver.calculateMatchScore(candidate.profile.capabilities, requiredCapabilities);
    const availabilityScore = candidate.status.load < 1.0 ? 1.0 - candidate.status.load : 0.0;
    const permissionScore = 1.0;

    // Weight load availability highest
    const compositeScore = availabilityScore * 0.6 + matchScore * 0.3 + permissionScore * 0.1;

    return {
      matchScore,
      permissionScore,
      availabilityScore,
      compositeScore,
      reason: `LoadBalancedStrategy: avail=${availabilityScore.toFixed(2)}, match=${matchScore.toFixed(2)}`
    };
  }
}

export class PriorityFirstStrategy implements WorkerSelectionStrategy {
  evaluate(candidate: CandidateWorker, requiredCapabilities: string[]): AssignmentEvaluation {
    const matchScore = CapabilityResolver.calculateMatchScore(candidate.profile.capabilities, requiredCapabilities);
    const availabilityScore = candidate.status.load < 1.0 ? 1.0 - candidate.status.load : 0.0;
    const permissionScore = candidate.profile.permissions.includes('CAN_EXECUTE' as any) ? 1.0 : 0.0;

    const compositeScore = permissionScore * 0.4 + matchScore * 0.4 + availabilityScore * 0.2;

    return {
      matchScore,
      permissionScore,
      availabilityScore,
      compositeScore,
      reason: `PriorityFirstStrategy: perm=${permissionScore.toFixed(2)}, match=${matchScore.toFixed(2)}`
    };
  }
}
