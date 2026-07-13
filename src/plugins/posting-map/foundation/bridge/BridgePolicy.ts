export class BridgePolicy {
  public readonly bridgeEnabled: boolean;
  public readonly timeout: number;
  public readonly heartbeatEnabled: boolean;

  constructor(params: {
    bridgeEnabled?: boolean;
    timeout?: number;
    heartbeatEnabled?: boolean;
  }) {
    this.bridgeEnabled = params.bridgeEnabled !== false;
    this.timeout = params.timeout || 5000;
    this.heartbeatEnabled = params.heartbeatEnabled !== false;
  }
}
