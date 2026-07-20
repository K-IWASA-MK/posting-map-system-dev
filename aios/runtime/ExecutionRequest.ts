export interface ExecutionRequest {
  readonly requestId: string;
  readonly sessionId: string;
  readonly agentId: string;
  readonly protocolId: string;
  readonly protocolVersion: string;
  readonly runtimeStage: string;
}
