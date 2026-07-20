import { AgentCapability } from './AgentCapability';

export interface AgentDefinition {
  readonly agentId: string;
  readonly role: string;
  readonly promptProfile: string;
  readonly capabilities: readonly AgentCapability[];
  readonly allowedTools: readonly string[];
}
