export interface WorkflowContext {
  workflowId: string;
  correlationId: string;
  artifacts: Record<string, string>;
  variables: Record<string, unknown>;
  outputs: Record<string, unknown>;
  environment: Record<string, string>;
  runtimeResults: Record<string, unknown>;
}
