import { ApiRequest } from '../src/api/ApiRequest';
import { ApiExecutionContext } from '../src/gas/ApiExecutionContext';
import { BridgeMessage } from '../src/bridge/BridgeMessage';
import { BridgeStatus } from '../src/bridge/BridgeStatus';
import { AIOSBridgeProvider } from '../src/bridge/AIOSBridgeProvider';
import { BridgeMessageMapper } from '../src/bridge/BridgeMessageMapper';
import { AIOSBridgePipeline } from '../src/bridge/AIOSBridgePipeline';
import { BridgeException } from '../src/exceptions/BridgeException';
import { GasConfigurationProvider } from '../src/gas/GasConfigurationProvider';
import { BridgeEvent } from '../src/bridge/BridgeEvent';
import { BridgeEventDispatcher } from '../src/bridge/BridgeEventDispatcher';
import { BridgeListener } from '../src/bridge/BridgeListener';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test Bridge] Starting AIOS Bridge Foundation tests...');

  // 1. Message Mapper Verification
  {
    const req = new ApiRequest({
      method: 'POST',
      path: '/aios',
      query: { action: 'submitProposal' },
      body: { content: 'hello aios' },
      version: 'v2',
      requestId: 'req-brg-1'
    });

    const msg = BridgeMessageMapper.toBridgeMessage(req);
    assert(msg.messageId === 'req-brg-1', 'Message ID mapping mismatch');
    assert(msg.messageType === 'API_EXECUTION_REQUEST', 'Message Type mapping mismatch');
    assert(msg.source === 'POSTING_MAP', 'Source field mismatch');
    assert(msg.destination === 'AIOS', 'Destination field mismatch');
    assert(msg.payload.method === 'POST', 'Payload method mapping failed');
    assert(msg.payload.body.content === 'hello aios', 'Payload body mapping failed');
    assert(msg.protocolVersion === '1.0', 'Protocol version should default to 1.0');
    assert(msg.correlationId === 'req-brg-1', 'Correlation ID should map to requestId');

    const internalData = BridgeMessageMapper.fromBridgeMessage(msg);
    assert(internalData.success === true, 'Response parsing translation mismatch');
    assert(internalData.payload.method === 'POST', 'Response parsing body payload mismatch');

    console.log('[Test Bridge] Message mapper translation: PASSED');
  }

  // 2. Dispatcher connectivity and heartbeat notifications tracking
  {
    let eventsLogged: BridgeEvent[] = [];
    const testListener: BridgeListener = {
      onEvent(event) {
        eventsLogged.push(event);
      }
    };

    BridgeEventDispatcher.addListener(testListener);

    const pipeline = AIOSBridgePipeline.getInstance();
    const context = new ApiExecutionContext();
    const req = new ApiRequest({
      method: 'POST',
      path: '/aios',
      version: 'v2',
      requestId: 'req-brg-2'
    });

    pipeline.execute(req, context);

    assert(eventsLogged.some(e => e.eventType === 'HEARTBEAT'), 'Heartbeat event should have been dispatched');
    assert(eventsLogged.some(e => e.eventType === 'SEND'), 'Send event should have been dispatched');
    assert(eventsLogged.some(e => e.eventType === 'RECEIVE'), 'Receive event should have been dispatched');

    const bridgeCtx = context.getBridgeContext();
    assert(bridgeCtx !== null, 'BridgeContext should be set inside execution context');
    assert(bridgeCtx!.provider === 'AIOSBridgeProvider', 'Incorrect bridge provider name in context');
    assert(bridgeCtx!.status === BridgeStatus.CONNECTED, 'Connection status should be CONNECTED');
    assert(bridgeCtx!.lastHeartbeat > 0, 'Last heartbeat timestamp should be populated');

    BridgeEventDispatcher.removeListener(testListener);
    BridgeEventDispatcher.clear();
    console.log('[Test Bridge] Event dispatcher and execution context bindings: PASSED');
  }

  // 3. Status checks and Exception cases
  {
    const pipeline = AIOSBridgePipeline.getInstance();
    const req = new ApiRequest({
      method: 'POST',
      path: '/aios',
      version: 'v2',
      requestId: 'req-brg-3'
    });

    // 3.1 Status is DEGRADED/DISCONNECTED -> throws PM-BRG-002
    pipeline.getProvider().setMockStatus(BridgeStatus.DISCONNECTED);
    const contextDegraded = new ApiExecutionContext();

    let unavailThrew = false;
    try {
      pipeline.execute(req, contextDegraded);
    } catch (e) {
      if (e instanceof BridgeException) {
        unavailThrew = true;
        assert(e.code === 'PM-BRG-002', 'Expected Unavailable code PM-BRG-002');
      }
    }
    assert(unavailThrew === true, 'Pipeline executed successfully even with provider disconnected');

    // Restore provider status
    pipeline.getProvider().setMockStatus(BridgeStatus.CONNECTED);

    // 3.2 Bridge toggle disabled -> throws PM-BRG-001 on hit
    const configInstance = GasConfigurationProvider.getInstance();
    const originalGetFeatureFlags = configInstance.getFeatureFlags;
    const originalFlags = originalGetFeatureFlags.call(configInstance);

    configInstance.getFeatureFlags = () => ({
      ...originalFlags,
      bridgeEnabled: false
    });

    const contextDisabled = new ApiExecutionContext();
    let disabledThrew = false;
    try {
      pipeline.execute(req, contextDisabled);
    } catch (e) {
      if (e instanceof BridgeException) {
        disabledThrew = true;
        assert(e.code === 'PM-BRG-001', 'Expected Disabled code PM-BRG-001');
      }
    }
    assert(disabledThrew === true, 'Pipeline hit /aios successfully even when bridge is disabled');

    // Restore configuration flags
    configInstance.getFeatureFlags = originalGetFeatureFlags;

    console.log('[Test Bridge] Exception and status validations: PASSED');
  }

  console.log('[Test Bridge] All AIOS Bridge Foundation tests completed.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  AIOS BRIDGE FOUNDATION TESTS PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[AIOS Bridge Test Failure]', err);
  if (typeof (globalThis as any).process !== 'undefined') {
    (globalThis as any).process.exit(1);
  }
});
