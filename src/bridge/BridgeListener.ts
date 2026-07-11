import { BridgeEvent } from './BridgeEvent';

export interface BridgeListener {
  onEvent(event: BridgeEvent): void;
}
