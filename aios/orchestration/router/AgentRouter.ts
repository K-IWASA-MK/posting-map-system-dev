import { ProjectRegistry } from '../../projects/registry/ProjectRegistry';
import { TaskRequest } from '../task/TaskTypes';
import { TaskRiskLevel } from '../executive/ExecutiveTypes';
import { AIAssignmentContract } from '../../workforce/AIAssignmentContract';
import { AgentScoreEngine, EmployeeProfileMock } from './AgentScoreEngine';
import { 
  AgentSelectionScore, 
  AssignmentDecisionRecord, 
  CandidateRejectionReason 
} from './RouterTypes';

export class AgentRouter {
  private readonly projectRegistry: ProjectRegistry;
  private readonly employeePool: Map<string, EmployeeProfileMock> = new Map();

  constructor(projectRegistry: ProjectRegistry) {
    this.projectRegistry = projectRegistry;
  }

  /**
   * Registers an employee profile into the router's active workforce pool.
   */
  public registerEmployeeProfile(profile: EmployeeProfileMock): void {
    this.employeePool.set(profile.employeeId, profile);
  }

  /**
   * Assigns a TaskRequest to the optimal AI Employee and issues an AIAssignmentContract
   * complete with an immutable AssignmentDecisionRecord for accountability.
   */
  public assignTask(
    taskRequest: TaskRequest,
    riskLevel: TaskRiskLevel = "LOW"
  ): AIAssignmentContract {
    const projectDescriptor = this.projectRegistry.resolve(taskRequest.targetProjectId);
    if (!projectDescriptor) {
      throw new Error(`[AgentRouter] Target project '${taskRequest.targetProjectId}' is not registered in ProjectRegistry.`);
    }

    if (this.employeePool.size === 0) {
      throw new Error('[AgentRouter] No AI Employees available in workforce pool for routing.');
    }

    const profiles = Array.from(this.employeePool.values());
    const scores: AgentSelectionScore[] = profiles.map(profile =>
      AgentScoreEngine.evaluate(profile, taskRequest, riskLevel)
    );

    // Find highest overall score
    let maxScore = -1;
    scores.forEach(s => {
      if (s.overallScore > maxScore) {
        maxScore = s.overallScore;
      }
    });

    // Identify top candidates (tied within epsilon threshold)
    const topScored = scores.filter(s => Math.abs(s.overallScore - maxScore) < 0.0001);
    const topProfiles = topScored.map(s => this.employeePool.get(s.employeeId)!);

    // Apply Tie-Breaker Policy if multiple top candidates exist
    const selectedProfile = AgentScoreEngine.resolveTieBreaker(topProfiles, riskLevel);
    const selectedScoreObj = scores.find(s => s.employeeId === selectedProfile.employeeId)!;

    // Formulate Rejection Reasons for unselected candidates
    const rejectedCandidates: CandidateRejectionReason[] = scores
      .filter(s => s.employeeId !== selectedProfile.employeeId)
      .map(s => ({
        employeeId: s.employeeId,
        score: s.overallScore,
        reason: s.overallScore < maxScore 
          ? `Overall score (${s.overallScore}) lower than selected score (${maxScore}).`
          : `Tie-breaker policy (${this.getPolicyName(riskLevel)}) selected employee ${selectedProfile.employeeId}.`
      }));

    const appliedPolicy = this.getPolicyName(riskLevel, topProfiles.length > 1);

    const decisionRecord: AssignmentDecisionRecord = {
      decisionId: `DEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      taskId: taskRequest.taskId,
      selectedEmployeeId: selectedProfile.employeeId,
      selectedScore: selectedScoreObj.overallScore,
      rejectedCandidates,
      appliedPolicy,
      timestamp: Date.now()
    };

    const assignmentId = `ASG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      assignmentId,
      taskId: taskRequest.taskId,
      employeeId: selectedProfile.employeeId,
      targetProjectId: taskRequest.targetProjectId,
      taskRequest,
      projectManifest: projectDescriptor.manifest,
      runtimePolicy: projectDescriptor.manifest.runtimePolicy,
      decisionRecord,
      assignedAt: Date.now()
    };
  }

  private getPolicyName(riskLevel: TaskRiskLevel, isTie: boolean = false): string {
    if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
      return isTie ? "HIGH_RISK_TRUST_TIE_BREAKER" : "HIGH_RISK_SAFETY_FIRST";
    } else if (riskLevel === "MEDIUM") {
      return isTie ? "MEDIUM_RISK_BALANCE_TIE_BREAKER" : "MEDIUM_RISK_BALANCED";
    } else {
      return isTie ? "LOW_RISK_GROWTH_TIE_BREAKER" : "LOW_RISK_GROWTH_FIRST";
    }
  }
}
