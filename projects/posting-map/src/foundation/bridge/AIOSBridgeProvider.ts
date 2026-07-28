import { BridgeProvider } from './BridgeProvider';
import { BridgeMessage } from './BridgeMessage';
import { BridgeResult } from './BridgeResult';
import { BridgeStatus } from './BridgeStatus';
import { AIOSBridgeMode, resolveBridgeMode } from './AIOSBridgeMode';
import { AIOSBridgeTaskAdapter } from './AIOSBridgeTaskAdapter';
import { AIOSClientFactory, IAIOSClient } from './AIOSClientBoundary';
import { ExecutionTask } from '../../../../../sdk/execution/ExecutionTaskModel';

export class AIOSBridgeProvider implements BridgeProvider {
  private lastReceivedMessage: BridgeMessage | null = null;
  private currentStatus: BridgeStatus = BridgeStatus.CONNECTED;
  private mode: AIOSBridgeMode = AIOSBridgeMode.STUB;

  constructor(mode: AIOSBridgeMode = AIOSBridgeMode.STUB) {
    this.mode = mode;
  }

  public setMode(mode: AIOSBridgeMode | string): void {
    this.mode = resolveBridgeMode(typeof mode === 'string' ? mode : mode);
  }

  public getMode(): AIOSBridgeMode {
    return this.mode;
  }

  public send(message: BridgeMessage): BridgeResult {
    try {
      const request = AIOSBridgeTaskAdapter.toTaskIntakeRequest(message);
      const client: IAIOSClient = AIOSClientFactory.createClient(this.mode);
      const rawResult = client.submit(request);

      let reply: BridgeMessage;
      if (this.mode === AIOSBridgeMode.LIVE) {
        reply = AIOSBridgeTaskAdapter.fromExecutionTask(rawResult as ExecutionTask, message);
      } else {
        reply = AIOSBridgeTaskAdapter.fromMockResult(
          rawResult as { echo: Record<string, any>; status: string; details: string },
          message
        );
      }

      this.lastReceivedMessage = reply;
      return BridgeResult.successResult(reply);
    } catch (error: any) {
      return BridgeResult.failureResult(error.message || 'AIOS bridge transmission failed');
    }
  }

  public receive(): BridgeMessage | null {
    const msg = this.lastReceivedMessage;
    this.lastReceivedMessage = null;
    return msg;
  }

  public health(): boolean {
    return this.currentStatus === BridgeStatus.CONNECTED;
  }

  public status(): BridgeStatus {
    return this.currentStatus;
  }

  public setMockStatus(status: BridgeStatus): void {
    this.currentStatus = status;
  }
}
