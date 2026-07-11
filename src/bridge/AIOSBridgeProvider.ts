import { BridgeProvider } from './BridgeProvider';
import { BridgeMessage } from './BridgeMessage';
import { BridgeResult } from './BridgeResult';
import { BridgeStatus } from './BridgeStatus';

export class AIOSBridgeProvider implements BridgeProvider {
  private lastReceivedMessage: BridgeMessage | null = null;
  private currentStatus: BridgeStatus = BridgeStatus.CONNECTED;

  public send(message: BridgeMessage): BridgeResult {
    // Stub: simulate immediate success, returning an echo reply from AIOS
    const reply = new BridgeMessage({
      messageId: `rep-${message.messageId}`,
      messageType: `${message.messageType}.reply`,
      timestamp: Date.now(),
      source: 'AIOS',
      destination: 'POSTING_MAP',
      payload: {
        echo: message.payload,
        status: 'PROPOSAL_RECEIVED',
        details: 'Stub acknowledgment successfully generated'
      },
      protocolVersion: message.protocolVersion,
      correlationId: message.correlationId
    });

    this.lastReceivedMessage = reply;
    return BridgeResult.successResult(reply);
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

  // Developer method to simulate status degradation/disconnects
  public setMockStatus(status: BridgeStatus): void {
    this.currentStatus = status;
  }
}
