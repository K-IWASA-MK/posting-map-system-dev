import { ProjectManifest } from '../projects/contracts/ProjectManifest';
import { ProjectRuntimePolicy } from '../projects/contracts/ProjectRuntimePolicy';
import { TaskRequest } from '../orchestration/task/TaskTypes';
import { AssignmentDecisionRecord } from '../orchestration/router/RouterTypes';

/**
 * AIAssignmentContract is the immutable formal assignment contract
 * issued by AIOS Core to an AI Employee for executing a specific TaskRequest.
 */
export interface AIAssignmentContract {
  readonly assignmentId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly targetProjectId: string;
  readonly taskRequest: TaskRequest;
  readonly projectManifest: ProjectManifest;
  readonly runtimePolicy: ProjectRuntimePolicy;
  readonly decisionRecord: AssignmentDecisionRecord; // Accountability record (Why this agent was chosen)
  readonly memoryContextRef?: string;                 // Reserved for AIOS-005 AgentMemory connection
  readonly assignedAt: number;
}
