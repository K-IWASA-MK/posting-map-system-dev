export class BridgeMessage {
  public readonly messageId: string;
  public readonly messageType: string;
  public readonly timestamp: number;
  public readonly source: string;
  public readonly destination: string;
  public readonly payload: Record<string, any>;
  public readonly protocolVersion: string;
  public readonly correlationId: string;

  constructor(params: {
    messageId: string;
    messageType: string;
    timestamp: number;
    source: string;
    destination: string;
    payload: Record<string, any>;
    protocolVersion?: string;
    correlationId?: string;
  }) {
    this.messageId = params.messageId;
    this.messageType = params.messageType;
    this.timestamp = params.timestamp;
    this.source = params.source;
    this.destination = params.destination;
    this.payload = params.payload;
    this.protocolVersion = params.protocolVersion || '1.0';
    this.correlationId = params.correlationId || `corr-${params.messageId}`;
  }
}
