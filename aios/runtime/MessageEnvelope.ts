export interface MessageEnvelope {
  readonly messageId: string;
  readonly sourceAgentId: string;
  readonly targetAgentId: string;
  readonly protocolId: string;
  readonly protocolVersion: string;
  readonly messageType: string;
  readonly payload: unknown;
  readonly createdAt: string;
}
