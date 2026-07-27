import { ProjectRegistry } from '../../projects/registry/ProjectRegistry';
import { IntentResolver } from './IntentResolver';
import { TaskPlanner } from '../task/TaskPlanner';
import { TaskLedger } from '../task/TaskLedger';
import { TaskRequest, TaskLedgerEntry } from '../task/TaskTypes';
import { IntentDecision, ClarificationRequest } from './ExecutiveTypes';

export interface ExecutiveResponse {
  readonly success: boolean;
  readonly decision: IntentDecision;
  readonly taskRequest?: TaskRequest;
  readonly ledgerEntry?: TaskLedgerEntry;
  readonly clarificationRequest?: ClarificationRequest;
}

export class ExecutiveController {
  private readonly intentResolver: IntentResolver;
  private readonly taskLedger: TaskLedger;

  constructor(projectRegistry: ProjectRegistry, taskLedger?: TaskLedger) {
    this.intentResolver = new IntentResolver(projectRegistry);
    this.taskLedger = taskLedger || new TaskLedger();
  }

  /**
   * Primary entry point for CEO natural language requests.
   * Processes the input, resolves intent, and either plans a TaskRequest + records TaskLedger,
   * or issues a structured ClarificationRequest.
   */
  public processRequest(rawInput: string): ExecutiveResponse {
    const decision = this.intentResolver.resolve(rawInput);

    if (decision.resolutionStatus === "RESOLVED" && decision.selectedProjectId) {
      const taskRequest = TaskPlanner.plan(decision);
      const ledgerEntry = this.taskLedger.record(taskRequest.taskId, decision);

      return {
        success: true,
        decision,
        taskRequest,
        ledgerEntry
      };
    }

    // Determine reason for clarification
    let reason: "PROJECT_AMBIGUITY" | "LOW_CONFIDENCE" | "HIGH_RISK" = "LOW_CONFIDENCE";
    if (decision.resolutionStatus === "AMBIGUOUS") {
      reason = "PROJECT_AMBIGUITY";
    } else if (decision.riskLevel === "HIGH" || decision.riskLevel === "CRITICAL") {
      reason = "HIGH_RISK";
    }

    const clarificationId = `CLR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const taskDraftId = `DRAFT-${Date.now()}`;

    let question = `Could you please clarify the target project for your request: "${rawInput}"?`;
    if (reason === "HIGH_RISK") {
      question = `Request involves ${decision.riskLevel} risk on project '${decision.selectedProjectId}'. Please confirm if you wish to proceed with analysis.`;
    } else if (decision.projectCandidates.length > 0) {
      const candidatesList = decision.projectCandidates.map(c => c.projectId).join(", ");
      question = `Did you mean one of the following projects: [${candidatesList}]? Please confirm.`;
    }

    const clarificationRequest: ClarificationRequest = {
      clarificationId,
      taskDraftId,
      reason,
      question,
      candidates: decision.projectCandidates,
      confidence: decision.confidence.overallConfidence,
      reasoning: decision.reasoning,
      riskLevel: decision.riskLevel,
      expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes expiration
    };

    return {
      success: false,
      decision,
      clarificationRequest
    };
  }

  public getTaskLedger(): TaskLedger {
    return this.taskLedger;
  }
}
