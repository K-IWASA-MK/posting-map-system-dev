import { BridgeMessage } from './BridgeMessage';

export class BridgeResult {
  public readonly success: boolean;
  public readonly response: BridgeMessage | null;
  public readonly failureReason: string | null;

  private constructor(success: boolean, response: BridgeMessage | null, failureReason: string | null) {
    this.success = success;
    this.response = response;
    this.failureReason = failureReason;
  }

  public static successResult(response: BridgeMessage): BridgeResult {
    return new BridgeResult(true, response, null);
  }

  public static failureResult(reason: string): BridgeResult {
    return new BridgeResult(false, null, reason);
  }
}
