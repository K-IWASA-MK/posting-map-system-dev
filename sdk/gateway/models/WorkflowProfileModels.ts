/**
 * WorkflowProfileModels.ts
 * 
 * AIOS Workflow Profile & Stage Definitions
 */

import { TaskPriority } from './TaskGatewayModels';
import { WorkflowType as ExtendedWorkflowType, WorkflowStage as ExtendedWorkflowStage } from './WorkflowProfile';

export * from './WorkflowProfile';

export type WorkflowStageLegacy = ExtendedWorkflowStage | 'CEO_APPROVAL' | 'DESIGN' | 'CLOSED' | 'AUDIT_CHECK' | 'INVESTIGATION';

export type WorkflowProfileType = ExtendedWorkflowType;

export interface WorkflowProfileDefinition {
  readonly profileName: WorkflowProfileType;
  readonly description: string;
  readonly workflowStages: ReadonlyArray<ExtendedWorkflowStage>;
  readonly requiredCapabilities: ReadonlyArray<string>;
  readonly defaultPriority: TaskPriority;
}
