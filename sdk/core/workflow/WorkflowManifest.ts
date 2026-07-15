import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeCapability } from '../runtime/RuntimeCapability';

export interface WorkflowTrigger {
  eventTypes: string[];
  conditions?: string[];
}

export interface WorkflowStep {
  id: string;
  capability?: RuntimeCapability; // For runtime resolution
  subWorkflow?: string; // For calling sub-workflows
  dependsOn?: string[]; // DAG edges
  condition?: string; // e.g. "qualityGate == PASS"
  payload?: Record<string, unknown>;
}

export interface WorkflowManifest extends RuntimeManifest {
  workflowId: string;
  triggers?: WorkflowTrigger[];
  steps: WorkflowStep[];
}
