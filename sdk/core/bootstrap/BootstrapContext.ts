import { BootstrapStep } from './BootstrapStep';

export interface BootstrapContext {
  workspaceId: string;
  repositoryId?: string;
  projectId?: string;
  traceId: string;
  executionId: string;
  ledgerId: string;
  dryRun: boolean;
  startedAt: string;
  currentStep: BootstrapStep;
  error?: Error;
}
