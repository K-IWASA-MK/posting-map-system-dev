import { AIEmployee } from '../../workforce/AIEmployee';
import { TaskRequest } from '../task/TaskTypes';
import { TaskRiskLevel } from '../executive/ExecutiveTypes';
import { AgentSelectionScore } from './RouterTypes';

export interface EmployeeProfileMock {
  readonly employeeId: string;
  readonly capabilities: readonly string[];
  readonly governanceTrustScore: number; // 0.0 - 1.0
  readonly domainExperiences: Record<string, number>; // projectId -> count
  readonly taskHistories: readonly string[]; // past rawIntent strings
  readonly totalTasksCompleted: number;
  readonly isAvailable: boolean;
}

export class AgentScoreEngine {
  /**
   * Evaluates an AIEmployee profile against a TaskRequest and returns a normalized AgentSelectionScore (0.0 - 1.0).
   */
  public static evaluate(
    profile: EmployeeProfileMock,
    taskRequest: TaskRequest,
    riskLevel: TaskRiskLevel
  ): AgentSelectionScore {
    // 1. Capability Match Score (0.0 - 1.0)
    let capabilityMatchScore = 1.0;
    if (taskRequest.requiredCapabilities.length > 0) {
      const matched = taskRequest.requiredCapabilities.filter(req =>
        profile.capabilities.includes(req) || profile.capabilities.includes("GENERAL")
      );
      capabilityMatchScore = matched.length / taskRequest.requiredCapabilities.length;
    }

    // 2. Governance Trust Score (Normalized 0.0 - 1.0)
    const governanceTrustScore = Math.min(Math.max(profile.governanceTrustScore, 0.0), 1.0);

    // 3. Domain Experience Score (Normalized 0.0 - 1.0, capped at 20 tasks = 1.0)
    const domainCount = profile.domainExperiences[taskRequest.targetProjectId] || 0;
    const domainExperienceScore = Math.min(domainCount / 20.0, 1.0);

    // 4. Historical Task Similarity Score (Normalized 0.0 - 1.0)
    let historicalTaskSimilarityScore = 0.0;
    const rawLower = taskRequest.rawIntent.toLowerCase();
    profile.taskHistories.forEach(pastTask => {
      const pastLower = pastTask.toLowerCase();
      if (pastLower === rawLower) {
        historicalTaskSimilarityScore = Math.max(historicalTaskSimilarityScore, 1.0);
      } else if (rawLower.includes("liff") && pastLower.includes("liff")) {
        historicalTaskSimilarityScore = Math.max(historicalTaskSimilarityScore, 0.9);
      } else if (rawLower.includes("line") && pastLower.includes("line")) {
        historicalTaskSimilarityScore = Math.max(historicalTaskSimilarityScore, 0.8);
      } else if (rawLower.includes("gis") && pastLower.includes("gis")) {
        historicalTaskSimilarityScore = Math.max(historicalTaskSimilarityScore, 0.8);
      }
    });

    // 5. Learning Value Score (Higher score for junior agents with lower completed tasks)
    const learningValueScore = Math.max(1.0 - (profile.totalTasksCompleted / 50.0), 0.0);

    // 6. Workload Balance Score (1.0 = Fully Available, 0.0 = Busy)
    const workloadBalanceScore = profile.isAvailable ? 1.0 : 0.0;

    // Apply Risk-Based Weights
    let overallScore = 0.0;
    if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
      // Safety First: Trust 40%, Capability 40%, Domain 10%, Similarity 10%, Learning 0%
      overallScore = (capabilityMatchScore * 0.40) +
                     (governanceTrustScore * 0.40) +
                     (domainExperienceScore * 0.10) +
                     (historicalTaskSimilarityScore * 0.10);
    } else if (riskLevel === "MEDIUM") {
      // Balanced: Capability 35%, Trust 25%, Domain 15%, Similarity 10%, Learning 15%
      overallScore = (capabilityMatchScore * 0.35) +
                     (governanceTrustScore * 0.25) +
                     (domainExperienceScore * 0.15) +
                     (historicalTaskSimilarityScore * 0.10) +
                     (learningValueScore * 0.15);
    } else {
      // LOW Risk: Growth & Availability: Capability 30%, Learning 30%, Workload 20%, Domain 10%, Similarity 10%
      overallScore = (capabilityMatchScore * 0.30) +
                     (learningValueScore * 0.30) +
                     (workloadBalanceScore * 0.20) +
                     (domainExperienceScore * 0.10) +
                     (historicalTaskSimilarityScore * 0.10);
    }

    return {
      employeeId: profile.employeeId,
      capabilityMatchScore,
      governanceTrustScore,
      domainExperienceScore,
      historicalTaskSimilarityScore,
      learningValueScore,
      workloadBalanceScore,
      overallScore: Number(overallScore.toFixed(4))
    };
  }

  /**
   * Resolves tie-breaker between top scored candidate candidates based on TaskRiskLevel policy.
   */
  public static resolveTieBreaker(
    topCandidates: EmployeeProfileMock[],
    riskLevel: TaskRiskLevel
  ): EmployeeProfileMock {
    if (topCandidates.length === 1) {
      return topCandidates[0];
    }

    if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
      // Trust First: Select candidate with highest governance trust score
      return topCandidates.reduce((best, current) => 
        current.governanceTrustScore > best.governanceTrustScore ? current : best
      );
    } else if (riskLevel === "LOW") {
      // Growth First: Select candidate with lowest total completed tasks
      return topCandidates.reduce((best, current) => 
        current.totalTasksCompleted < best.totalTasksCompleted ? current : best
      );
    } else {
      // Medium Risk: Balance First (Round Robin / lowest domain count)
      return topCandidates.reduce((best, current) => 
        current.totalTasksCompleted < best.totalTasksCompleted ? current : best
      );
    }
  }
}
