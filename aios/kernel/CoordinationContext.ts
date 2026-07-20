export interface CoordinationContext {
  readonly coordinationId: string;
  readonly protocolId: string;
  readonly protocolVersion: string;
  readonly targetAgents: readonly string[];
  readonly createdAt: string;
}
