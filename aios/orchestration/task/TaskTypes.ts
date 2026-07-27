import { TaskRiskLevel, DecisionReason } from '../executive/ExecutiveTypes';

export type TaskStatus = 
  | "RECEIVED" 
  | "UNDERSTANDING" 
  | "PROJECT_RESOLVED" 
  | "PLAN_CREATED" 
  | "NEED_CLARIFICATION" 
  | "READY_FOR_ROUTING";

export interface TaskStepPlan {
  readonly stepNumber: number;
  readonly title: string;
  readonly description: string;
  readonly requiredCapability: string;
}

export interface TaskRequest {
  readonly taskId: string;
  readonly requester: "CEO";
  readonly rawIntent: string;
  readonly targetProjectId: string;
  readonly requiredCapabilities: readonly string[];
  readonly priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  readonly steps: readonly TaskStepPlan[];
  readonly status: TaskStatus;
  readonly createdAt: number;
}

export interface TaskLedgerEntry {
  readonly ledgerId: string;
  readonly taskId: string;
  readonly requester: string;
  readonly intentSummary: string;
  readonly selectedProjectId: string;
  readonly decisionReasoning: readonly DecisionReason[];
  readonly riskLevel: TaskRiskLevel;
  readonly timestamp: number;
}
