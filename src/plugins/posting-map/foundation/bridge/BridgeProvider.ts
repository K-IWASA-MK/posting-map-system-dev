import { BridgeMessage } from './BridgeMessage';
import { BridgeResult } from './BridgeResult';
import { BridgeStatus } from './BridgeStatus';

export interface BridgeProvider {
  send(message: BridgeMessage): BridgeResult;
  receive(): BridgeMessage | null;
  health(): boolean;
  status(): BridgeStatus;
}
