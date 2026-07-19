import { RuntimeCapability } from './RuntimeCapability';

export interface RuntimeContext {
  runtimeId: string;
  workspaceId: string;
  executionId: string;
  traceId: string;
  configuration: Record<string, unknown>;
  services: Record<string, unknown>; // References to shared services if any, or API clients

  // Phase 4 additions
  sessionId?: string;
  environment?: string;
  capabilities?: RuntimeCapability[];
}
