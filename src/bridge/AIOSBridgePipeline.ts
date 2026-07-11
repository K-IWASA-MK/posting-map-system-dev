import { ApiRequest } from '../api/ApiRequest';
import { ApiExecutionContext } from '../gas/ApiExecutionContext';
import { BridgeContext } from './BridgeContext';
import { BridgeStatus } from './BridgeStatus';
import { BridgePolicy } from './BridgePolicy';
import { BridgeMessageMapper } from './BridgeMessageMapper';
import { AIOSBridgeProvider } from './AIOSBridgeProvider';
import { BridgeException } from '../exceptions/BridgeException';
import { GasConfigurationProvider } from '../gas/GasConfigurationProvider';
import { BridgeEvent } from './BridgeEvent';
import { BridgeEventType } from './BridgeEvent';
import { BridgeEventDispatcher } from './BridgeEventDispatcher';

export class AIOSBridgePipeline {
  private static instance: AIOSBridgePipeline | null = null;
  private provider = new AIOSBridgeProvider();

  private constructor() {}

  public static getInstance(): AIOSBridgePipeline {
    if (!AIOSBridgePipeline.instance) {
      AIOSBridgePipeline.instance = new AIOSBridgePipeline();
    }
    return AIOSBridgePipeline.instance;
  }

  // Developer access to bridge provider stub configuration
  public getProvider(): AIOSBridgeProvider {
    return this.provider;
  }

  public execute(request: ApiRequest, context: ApiExecutionContext): void {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    // 1. Resolve policy
    const policy = new BridgePolicy({
      bridgeEnabled: flags.bridgeEnabled !== false,
      timeout: config.getLockTimeout() / 2, // Map to system timeout metrics
      heartbeatEnabled: flags.bridgeHeartbeat !== false
    });

    // 2. Feature toggles bypass check
    if (!policy.bridgeEnabled) {
      const bridgeCtx = new BridgeContext({
        provider: 'AIOSBridgeProvider',
        status: BridgeStatus.DISCONNECTED,
        lastHeartbeat: 0
      });
      context.setBridgeContext(bridgeCtx);

      // Throws if trying to hit AIOS specific paths
      if (request.path === '/aios') {
        throw new BridgeException(
          'PM-BRG-001',
          'AIOS Bridge connectivity disabled in system settings.',
          request.requestId
        );
      }
      return;
    }

    // 3. Status checks
    const status = this.provider.status();
    if (status !== BridgeStatus.CONNECTED) {
      const bridgeCtx = new BridgeContext({
        provider: 'AIOSBridgeProvider',
        status,
        lastHeartbeat: 0
      });
      context.setBridgeContext(bridgeCtx);

      BridgeEventDispatcher.dispatch(new BridgeEvent({
        eventId: `ev-fail-${request.requestId}`,
        eventType: BridgeEventType.FAILED,
        timestamp: Date.now(),
        metadata: { status, reason: 'Provider not connected' }
      }));

      throw new BridgeException(
        'PM-BRG-002',
        `AIOS Bridge connection is unavailable. Status: ${status}`,
        request.requestId
      );
    }

    // 4. Dispatch heartbeat events if enabled
    if (policy.heartbeatEnabled) {
      BridgeEventDispatcher.dispatch(new BridgeEvent({
        eventId: `ev-hb-${request.requestId}`,
        eventType: BridgeEventType.HEARTBEAT,
        timestamp: Date.now()
      }));
    }

    // 5. Send message only on AIOS designated endpoints
    if (request.path === '/aios') {
      try {
        const msg = BridgeMessageMapper.toBridgeMessage(request);

        BridgeEventDispatcher.dispatch(new BridgeEvent({
          eventId: `ev-snd-${request.requestId}`,
          eventType: BridgeEventType.SEND,
          timestamp: Date.now(),
          metadata: { messageId: msg.messageId }
        }));

        const result = this.provider.send(msg);

        if (!result.success || !result.response) {
          throw new Error(result.failureReason || 'Delivery Timeout');
        }

        BridgeEventDispatcher.dispatch(new BridgeEvent({
          eventId: `ev-rcv-${request.requestId}`,
          eventType: BridgeEventType.RECEIVE,
          timestamp: Date.now(),
          metadata: { correlationId: result.response.correlationId }
        }));

      } catch (e: any) {
        throw new BridgeException(
          'PM-BRG-003',
          `AIOS communication failure: ${e.message}`,
          request.requestId
        );
      }
    }

    // 6. Bind Context
    const bridgeCtx = new BridgeContext({
      provider: 'AIOSBridgeProvider',
      status: BridgeStatus.CONNECTED,
      lastHeartbeat: Date.now()
    });
    context.setBridgeContext(bridgeCtx);
  }
}
