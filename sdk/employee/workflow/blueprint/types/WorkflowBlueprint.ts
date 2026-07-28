/**
 * WorkflowBlueprint.ts
 * 
 * Non-executable Specification Blueprint for Workflows and Stage sequences
 */

import { WorkflowCategory } from '../../types/WorkflowCategory';
import { WorkflowStage } from '../../stage/types/WorkflowStage';

export interface WorkflowBlueprint {
  blueprintId: string;
  workflowName: string;
  category: WorkflowCategory;
  description: string;
  stages: WorkflowStage[];
}
