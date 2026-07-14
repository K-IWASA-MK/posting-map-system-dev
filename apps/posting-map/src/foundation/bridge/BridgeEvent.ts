export type BridgeEventType = 'CONNECTED' | 'DISCONNECTED' | 'SEND' | 'RECEIVE' | 'HEARTBEAT' | 'FAILED';

export const BridgeEventType = {
  CONNECTED: 'CONNECTED' as BridgeEventType,
  DISCONNECTED: 'DISCONNECTED' as BridgeEventType,
  SEND: 'SEND' as BridgeEventType,
  RECEIVE: 'RECEIVE' as BridgeEventType,
  HEARTBEAT: 'HEARTBEAT' as BridgeEventType,
  FAILED: 'FAILED' as BridgeEventType
};

export class BridgeEvent {
  public readonly eventId: string;
  public readonly eventType: BridgeEventType;
  public readonly timestamp: number;
  public readonly metadata: Record<string, any>;

  constructor(params: {
    eventId: string;
    eventType: BridgeEventType;
    timestamp: number;
    metadata?: Record<string, any>;
  }) {
    this.eventId = params.eventId;
    this.eventType = params.eventType;
    this.timestamp = params.timestamp;
    this.metadata = params.metadata || {};
  }
}
