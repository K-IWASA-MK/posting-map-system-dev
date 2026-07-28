import { AIOSBridgeMode } from './AIOSBridgeMode';
import { IAIOSClient } from './AIOSClientBoundary';
import { MockAIOSClient } from './MockAIOSClient';
import { LiveAIOSClient } from './LiveAIOSClient';

export class AIOSClientFactory {
  public static createClient(mode: AIOSBridgeMode): IAIOSClient {
    if (mode === AIOSBridgeMode.LIVE) {
      return new LiveAIOSClient();
    }
    return new MockAIOSClient();
  }
}
