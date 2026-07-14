import { BridgeStatus } from './BridgeStatus';

export class BridgeContext {
  public readonly provider: string;
  public readonly status: BridgeStatus;
  public readonly lastHeartbeat: number;
  public readonly metadata: Record<string, any>;

  constructor(params: {
    provider: string;
    status: BridgeStatus;
    lastHeartbeat: number;
    metadata?: Record<string, any>;
  }) {
    this.provider = params.provider;
    this.status = params.status;
    this.lastHeartbeat = params.lastHeartbeat;
    this.metadata = params.metadata || {};
  }
}
