import { SecurityRuntime } from '../../../sdk/core/security/SecurityRuntime';
import { SandboxManager } from '../../../sdk/core/security/sandbox/SandboxManager';
import { SecurityContext, CapabilityToken } from '../../../sdk/core/security/SecurityModels';
import { AIOSEventBus } from '../../../sdk/core/event/AIOSEventBus';
import { RuntimeCapability } from '../../../sdk/core/runtime/RuntimeCapability';
import { SandboxInstance } from '../../../sdk/core/security/sandbox/SandboxInstance';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testAuthorizationEngine() {
  console.log('[Test 1] Authorization Engine starting...');
  const eventBus = new AIOSEventBus();
  const securityRuntime = new SecurityRuntime(eventBus);
  await securityRuntime.start();

  const highTrustCtx: SecurityContext = {
    contextId: 'CTX-1',
    runtimeId: 'core.runtime',
    principalId: 'admin-agent',
    sessionId: 'sess-1',
    trustLevel: 'HIGH',
    capabilities: ['ledger:write', 'ledger:read']
  };

  const lowTrustCtx: SecurityContext = {
    contextId: 'CTX-2',
    runtimeId: 'plugin.runner',
    principalId: 'untrusted-plugin',
    sessionId: 'sess-2',
    trustLevel: 'LOW',
    capabilities: []
  };

  // 1. High trust context should be allowed standard permissions
  const auth1 = await securityRuntime.authorize(highTrustCtx, 'ledger', 'write');
  assert(auth1.result === 'ALLOW', 'High trust context should be authorized for ledger:write');

  // 2. Low trust context should be denied by default zero-trust check
  const auth2 = await securityRuntime.authorize(lowTrustCtx, 'ledger', 'write');
  assert(auth2.result === 'DENY', 'Low trust context should be denied by default');

  // 3. Issue Capability Token for Low Trust context
  const token = securityRuntime.generateToken('untrusted-plugin', ['ledger:write'], 1000); // 1s lifespan
  const auth3 = await securityRuntime.authorize(lowTrustCtx, 'ledger', 'write', token.tokenId);
  assert(auth3.result === 'ALLOW', 'Authorized token should grant permission');

  // 4. Test Token Expiration
  await new Promise(resolve => setTimeout(resolve, 1050));
  const auth4 = await securityRuntime.authorize(lowTrustCtx, 'ledger', 'write', token.tokenId);
  assert(auth4.result === 'DENY', 'Expired token must be denied');
  assert(auth4.reason.includes('expired'), 'Expected token expiration message');

  // 5. Test Token Revocation
  const token2 = securityRuntime.generateToken('untrusted-plugin', ['ledger:write']);
  securityRuntime.revokeToken(token2.tokenId);
  const auth5 = await securityRuntime.authorize(lowTrustCtx, 'ledger', 'write', token2.tokenId);
  assert(auth5.result === 'DENY', 'Revoked token must be denied');
  assert(auth5.reason.includes('revoked'), 'Expected token revoked message');

  console.log('[Test 1] Authorization Engine: PASSED');
}

async function testSecretBroker() {
  console.log('[Test 2] Secret Broker mediation starting...');
  const eventBus = new AIOSEventBus();
  const securityRuntime = new SecurityRuntime(eventBus);
  await securityRuntime.start();

  const highCtx: SecurityContext = {
    contextId: 'CTX-3',
    runtimeId: 'core.runtime',
    principalId: 'admin',
    sessionId: 'sess-3',
    trustLevel: 'HIGH',
    capabilities: ['*']
  };

  const lowCtx: SecurityContext = {
    contextId: 'CTX-4',
    runtimeId: 'plugin.runner',
    principalId: 'plugin-x',
    sessionId: 'sess-4',
    trustLevel: 'LOW',
    capabilities: []
  };

  // High trust gets DB connection string
  const val1 = await securityRuntime.getSecret(highCtx, 'DB_CONN_STRING');
  assert(val1 !== undefined, 'High trust context should obtain secret');
  assert(val1 === 'mongodb://localhost:27017/aios', 'Secret value mismatch');

  // Low trust gets denied (returns undefined)
  const val2 = await securityRuntime.getSecret(lowCtx, 'DB_CONN_STRING');
  assert(val2 === undefined, 'Low trust context must be denied secret access');

  console.log('[Test 2] Secret Broker mediation: PASSED');
}

async function testSandboxLifecycle() {
  console.log('[Test 3] Sandbox Instance Lifecycle starting...');
  const eventBus = new AIOSEventBus();
  const securityRuntime = new SecurityRuntime(eventBus);
  await securityRuntime.start();

  const manager = new SandboxManager(securityRuntime);

  // Create Sandbox
  const sandbox = await manager.createSandbox('plugin-logger', 'READ_ONLY');
  assert(sandbox.getState() === 'INITIALIZED', 'Sandbox state should be INITIALIZED after create');
  assert(manager.getActiveSandboxCount() === 1, 'Should have exactly 1 active sandbox');

  // Run simulated script
  const result = await manager.executeInSandbox(sandbox.sandboxId, 'console.log("hello");');
  assert(sandbox.getState() === 'RUNNING', 'Sandbox state should transition to RUNNING');
  assert(result.includes('Simulated sandboxed execution'), 'Plugin return output mismatch');

  // Suspend
  await sandbox.suspend();
  assert(sandbox.getState() === 'SUSPENDED', 'Sandbox state should transition to SUSPENDED');

  // Destroy
  await manager.destroySandbox(sandbox.sandboxId);
  assert(sandbox.getState() === 'DESTROYED', 'Sandbox state should transition to DESTROYED');
  assert(manager.getActiveSandboxCount() === 0, 'No active sandboxes should remain');

  console.log('[Test 3] Sandbox Instance Lifecycle: PASSED');
}

async function testSandboxIsolationViolation() {
  console.log('[Test 4] Sandbox Isolation and Violations starting...');
  const eventBus = new AIOSEventBus();
  const securityRuntime = new SecurityRuntime(eventBus);
  await securityRuntime.start();
  const manager = new SandboxManager(securityRuntime);

  const events: string[] = [];
  eventBus.subscribe('*', async (e) => {
    events.push(e.eventType);
  });

  const sandbox = await manager.createSandbox('rogue-plugin', 'FULLY_ISOLATED');

  // Case A: Plugin throws security exception
  let threw = false;
  try {
    await manager.executeInSandbox(sandbox.sandboxId, 'throw_security_exception;');
  } catch (err: any) {
    threw = true;
    assert(err.message.includes('Memory limit exceeded'), 'Security exception was not thrown');
  }
  assert(threw, 'Should throw exception on runtime security failure');
  assert(sandbox.getState() === 'DESTROYED', 'Sandbox must be forcefully destroyed on security violation');
  assert(events.includes('SecurityViolationDetected'), 'SecurityViolationDetected event not emitted');
  assert(events.includes('SandboxDestroyed'), 'SandboxDestroyed event not emitted on crash teardown');

  // Case B: Memory limit policy overflow check
  const sandbox2 = await manager.createSandbox('memory-hog-plugin', 'LIMITED_NETWORK');
  // Sandbox limit memory limit is 256MB. Simulating 300MB usage
  sandbox2.simulateResourceUsage(20, 300);

  let threwLimit = false;
  try {
    await manager.executeInSandbox(sandbox2.sandboxId, 'console.log("running ok");');
  } catch (err: any) {
    threwLimit = true;
    assert(err.message.includes('exceeded policy limit'), 'Expected limit exceeded exception');
  }
  assert(threwLimit, 'Should throw exception when process usage exceeds policy limits');
  assert(sandbox2.getState() === 'DESTROYED', 'Hog sandbox must be destroyed');

  console.log('[Test 4] Sandbox Isolation and Violations: PASSED');
}

async function testSecurityCapabilities() {
  console.log('[Test 5] Security Runtime Capability starting...');
  const eventBus = new AIOSEventBus();
  const securityRuntime = new SecurityRuntime(eventBus);

  assert(securityRuntime.descriptor.capabilities.includes(RuntimeCapability.SECURITY), 'Should expose SECURITY capability');
  console.log('[Test 5] Security Runtime Capability: PASSED');
}

async function runAll() {
  console.log('--- Starting Security Runtime & Sandbox Environment Foundation Tests ---');
  await testAuthorizationEngine();
  await testSecretBroker();
  await testSandboxLifecycle();
  await testSandboxIsolationViolation();
  await testSecurityCapabilities();
  console.log('--- All Security Runtime & Sandbox Environment Foundation Tests PASSED ---');
}

runAll().catch(err => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
