import { IntentDecision } from '../executive/ExecutiveTypes';
import { TaskRequest, TaskStepPlan, TaskStatus } from './TaskTypes';

export class TaskPlanner {
  /**
   * Plans execution steps and creates a TaskRequest from a RESOLVED IntentDecision.
   */
  public static plan(decision: IntentDecision): TaskRequest {
    if (decision.resolutionStatus !== "RESOLVED" || !decision.selectedProjectId) {
      throw new Error(`[TaskPlanner] Cannot create TaskRequest for unresolved intent (Status: ${decision.resolutionStatus}).`);
    }

    const taskId = `TASK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const steps: TaskStepPlan[] = [];

    // Formulate deterministic execution plan steps based on requiredCapabilities
    if (decision.requiredCapabilities.length === 0) {
      steps.push({
        stepNumber: 1,
        title: "Initial Analysis",
        description: `Perform general analysis for raw request: "${decision.rawInput}"`,
        requiredCapability: "GENERAL"
      });
    } else {
      decision.requiredCapabilities.forEach((cap, index) => {
        steps.push({
          stepNumber: index + 1,
          title: `Inspect & Verify ${cap}`,
          description: `Analyze and inspect components related to ${cap} capability in project ${decision.selectedProjectId}`,
          requiredCapability: cap
        });
      });
    }

    let priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL" = "NORMAL";
    if (decision.riskLevel === "HIGH" || decision.riskLevel === "CRITICAL") {
      priority = "HIGH";
    }

    return {
      taskId,
      requester: "CEO",
      rawIntent: decision.rawInput,
      targetProjectId: decision.selectedProjectId,
      requiredCapabilities: decision.requiredCapabilities,
      priority,
      steps,
      status: "PLAN_CREATED",
      createdAt: Date.now()
    };
  }
}
