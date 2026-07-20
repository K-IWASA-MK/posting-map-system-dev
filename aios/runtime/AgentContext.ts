export interface AgentContext {
  readonly agentId: string;
  readonly sessionId: string;
  readonly protocolId: string;
  readonly protocolVersion: string;
  readonly ledgerId: string;
  readonly createdAt: string;
}
