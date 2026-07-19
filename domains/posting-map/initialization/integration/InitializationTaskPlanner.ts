import { InitializationTask, InitializationAgentType } from "./InitializationTask";

export class InitializationTaskPlanner {
  /**
   * Generates a planned task array for a district initialization request ID.
   */
  public planTasks(requestId: string): InitializationTask[] {
    const agents: InitializationAgentType[] = [
      "DISTRICT_MASTER",
      "AREA_GENERATION",
      "ELECTION_DATA",
      "DASHBOARD",
      "VISUALIZATION"
    ];

    return agents.map((agentType, index) => ({
      taskId: `task-${requestId}-${index + 1}-${agentType.toLowerCase()}`,
      agentType,
      status: "PENDING"
    }));
  }
}
