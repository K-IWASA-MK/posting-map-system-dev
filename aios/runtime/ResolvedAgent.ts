import { AgentCapability } from './AgentCapability';

export interface ResolvedAgent {
  readonly agentId: string;
  readonly role: string;
  readonly promptProfile: string;
  readonly capabilities: readonly AgentCapability[];
  readonly allowedTools: readonly string[];
}
