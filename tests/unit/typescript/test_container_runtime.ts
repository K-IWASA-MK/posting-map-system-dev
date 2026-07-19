import { ContainerRuntime } from '../../../sdk/core/container/ContainerRuntime';
import { ContainerDefinition, RuntimeClass, ResourceQuota, ContainerMetadata } from '../../../sdk/core/container/ContainerDefinition';
import { ContainerLifecycleState, ContainerLifecycle } from '../../../sdk/core/container/ContainerLifecycle';
import { SandboxEngine } from '../../../sdk/core/sandbox/SandboxEngine';
import { SecretState } from '../../../sdk/core/sandbox/SecretIsolation';
import { AIOSEventBus } from '../../../sdk/core/event/AIOSEventBus';
import { RuntimeService } from '../../../sdk/core/runtime/service/RuntimeService';
import { RuntimeCapability } from '../../../sdk/core/runtime/RuntimeCapability';
import { LauncherExecutionRuntime } from '../../../core/launcher-runtime/LauncherExecutionRuntime';
import { LauncherResult } from '../../../core/launcher/LauncherResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Running Container Runtime & Sandboxed Process Execution Engine Tests...\n');

  const eventBus = new AIOSEventBus();
  const sandboxEngine = new SandboxEngine(eventBus);
  const containerRuntime = new ContainerRuntime(eventBus, sandboxEngine);

  const eventLog: string[] = [];
  eventBus.subscribe('*', async (event) => {
    eventLog.push(event.eventType);
  });

  const quota: ResourceQuota = {
    quotaId: 'Q-001',
    cpuLimit: 60,
    memoryLimit: 512,
    gpuLimit: 0,
    storageLimit: 10,
    networkLimit: 50
  };

  const metadata: ContainerMetadata = {
    containerId: 'C-001',
    imageDigest: 'sha256:1234567890abcdef',
    runtimeClass: RuntimeClass.CONTAINER,
    createdAt: new Date().toISOString(),
    owner: 'system',
    labels: { app: 'test' },
    annotations: { secure: 'true' }
  };

  const validDef: ContainerDefinition = {
    containerId: 'C-001',
    image: 'node:18-alpine',
    entrypoint: ['node', '-e', 'console.log("hello")'],
    environment: { ENV: 'production' },
    volumes: ['/tmp:/tmp:ro'],
    network: 'none',
    resourceQuota: quota,
    sandboxProfile: 'FULLY_ISOLATED',
    metadata
  };

  // ==========================================
  // 1. Container Definition & Creation
  // ==========================================
  console.log('   Testing Container Definition & Creation...');
  containerRuntime.getRegistry().register(validDef, 'CREATED');
  const entry = containerRuntime.getRegistry().get('C-001');
  assert(entry !== undefined, 'Container must be registered');
  assert(entry?.definition.metadata?.runtimeClass === RuntimeClass.CONTAINER, 'Runtime class must match');
  console.log('   ✓ Container Definition & Creation PASSED');

  // ==========================================
  // 2. Container Lifecycle
  // ==========================================
  console.log('   Testing Container Lifecycle state transitions...');
  const lifecycle = new ContainerLifecycle();
  assert(lifecycle.getState() === ContainerLifecycleState.CREATED, 'Initial state should be CREATED');
  
  lifecycle.transitionTo(ContainerLifecycleState.PREPARING);
  lifecycle.transitionTo(ContainerLifecycleState.RUNNING);
  lifecycle.transitionTo(ContainerLifecycleState.STOPPED);
  lifecycle.transitionTo(ContainerLifecycleState.TERMINATED);
  
  assert(lifecycle.getState() === ContainerLifecycleState.TERMINATED, 'Final state should be TERMINATED');
  assert(lifecycle.getHistory().length === 5, 'History log should contain 5 entries');
  console.log('   ✓ Container Lifecycle PASSED');

  // ==========================================
  // 3. Sandbox Policy & Evaluation Order
  // ==========================================
  console.log('   Testing Sandbox Policy evaluation order...');
  
  // Evaluation Order Stage 1 failure: Identity failure
  sandboxEngine.identityPassed = false;
  let validation = sandboxEngine.validatePolicyForContainer(validDef);
  assert(!validation.success && !!validation.reason?.includes('Identity verification failed'), 'Identity evaluation order blocker');
  
  // Evaluation Order Stage 2 failure: Trust failure
  sandboxEngine.identityPassed = true;
  sandboxEngine.trustPassed = false;
  validation = sandboxEngine.validatePolicyForContainer(validDef);
  assert(!validation.success && !!validation.reason?.includes('Trust score insufficient'), 'Trust evaluation order blocker');

  // Evaluation Order Stage 3 failure: Security failure
  sandboxEngine.trustPassed = true;
  sandboxEngine.securityPassed = false;
  validation = sandboxEngine.validatePolicyForContainer(validDef);
  assert(!validation.success && !!validation.reason?.includes('Security audit block'), 'Security evaluation order blocker');

  // Success path
  sandboxEngine.securityPassed = true;
  validation = sandboxEngine.validatePolicyForContainer(validDef);
  assert(validation.success, 'Valid policies should evaluate to success');

  // Filesystem violation: Write attempt on read-only FS path
  const invalidFSDef: ContainerDefinition = {
    ...validDef,
    volumes: ['/tmp:/tmp:rw'], // writable volume path
    sandboxProfile: 'READ_ONLY' // readonly isolation profile
  };
  validation = sandboxEngine.validatePolicyForContainer(invalidFSDef);
  assert(!validation.success && !!validation.reason?.includes('Filesystem write attempt blocked'), 'FS write blocker');

  // Network policy violation
  const invalidNetDef: ContainerDefinition = {
    ...validDef,
    network: 'bridge',
    sandboxProfile: 'FULLY_ISOLATED' // no network permitted
  };
  validation = sandboxEngine.validatePolicyForContainer(invalidNetDef);
  assert(!validation.success && !!validation.reason?.includes('network request blocked'), 'Network policy blocker');

  console.log('   ✓ Sandbox Policy & Evaluation Order PASSED');

  // ==========================================
  // 4. Capability Filter
  // ==========================================
  console.log('   Testing Capability Filter API action blocking...');
  const capFilter = sandboxEngine.getPolicy().getCapabilityFilter();
  
  // Test write action allowed/blocked
  assert(capFilter.verify(['FS_WRITE'], 'write_file'), 'Allowed filesystem write');
  assert(!capFilter.verify([], 'write_file'), 'Blocked filesystem write');

  // Test network action allowed/blocked
  assert(capFilter.verify(['NET_CONNECT'], 'fetch_url'), 'Allowed network connections');
  assert(!capFilter.verify([], 'fetch_url'), 'Blocked network connections');

  console.log('   ✓ Capability Filter PASSED');

  // ==========================================
  // 5. Secret Isolation
  // ==========================================
  console.log('   Testing Secret Isolation state transitions...');
  const secretSec = sandboxEngine.getSecretIsolation();
  secretSec.registerSecret('SEC-API-KEY');
  
  assert(secretSec.getSecretState('SEC-API-KEY') === SecretState.REGISTERED, 'Registered initial secret state');
  
  await secretSec.transitionTo('SEC-API-KEY', SecretState.AUTHORIZED);
  await secretSec.transitionTo('SEC-API-KEY', SecretState.INJECTED);
  assert(secretSec.getSecretState('SEC-API-KEY') === SecretState.INJECTED, 'Injected secret state');
  assert(eventLog.includes('SecretStateTransitioned'), 'SecretStateTransitioned event published');

  await secretSec.transitionTo('SEC-API-KEY', SecretState.REVOKED);
  await secretSec.transitionTo('SEC-API-KEY', SecretState.DESTROYED);
  assert(secretSec.getSecretState('SEC-API-KEY') === SecretState.DESTROYED, 'Destroyed secret state');

  console.log('   ✓ Secret Isolation PASSED');

  // ==========================================
  // 6. Supervisor Monitoring & Abnormal events
  // ==========================================
  console.log('   Testing Supervisor quota limits and abnormal events...');
  const supervisor = containerRuntime.getSupervisor();
  
  // Test QuotaExceeded trigger
  await supervisor.monitor(validDef, { cpu: 85, memory: 256 }); // CPU Limit is 60
  assert(eventLog.includes('QuotaExceeded'), 'QuotaExceeded event must be published');

  // Test abnormal crash trigger
  await supervisor.triggerCrash('C-001', 'Segmentation fault');
  assert(eventLog.includes('ProcessCrashed'), 'ProcessCrashed event must be published');

  // Test HealthCheckFailed trigger
  await supervisor.triggerHealthFailure('C-001', 'Ping timeout');
  assert(eventLog.includes('HealthCheckFailed'), 'HealthCheckFailed event must be published');

  console.log('   ✓ Supervisor Monitoring PASSED');

  // ==========================================
  // 7. Launcher Integration & Verification Guard
  // ==========================================
  console.log('   Testing Launcher Integration and execution guard...');
  const launcher = containerRuntime.getLauncher();
  
  await launcher.launch(validDef);
  
  assert(eventLog.includes('ContainerPrepared'), 'ContainerPrepared event published');
  assert(eventLog.includes('SandboxValidated'), 'SandboxValidated event published');
  assert(eventLog.includes('SandboxCreated'), 'SandboxCreated event published');
  assert(eventLog.includes('QuotaApplied'), 'QuotaApplied event published');
  assert(eventLog.includes('SecretsInjected'), 'SecretsInjected event published');
  assert(eventLog.includes('ProcessStarted'), 'ProcessStarted event published');

  const launcherRuntime = new LauncherExecutionRuntime();
  const mockResult: LauncherResult = {
    success: true,
    projectId: 'test-proj',
    mode: 'development',
    decision: 'allow',
    reasons: [],
    errorCodes: [],
    warnings: [],
    bootTimestamp: Date.now()
  };

  // Test executing via LauncherExecutionRuntime using container
  const proc = await launcherRuntime.execute(mockResult, {
    useContainer: true,
    containerId: 'C-MOCK',
    sandboxProfile: 'LIMITED_NETWORK',
    checkQueue: true,
    queueId: 'Q-ITEM-001'
  });
  assert(proc !== undefined, 'Process execution utilizing container launch succeeded');

  console.log('   ✓ Launcher Integration PASSED');

  // ==========================================
  // 8. Discovery
  // ==========================================
  console.log('   Testing Capability Discovery registration...');
  const runtimeService = new RuntimeService(eventBus);
  
  await runtimeService.register(containerRuntime, 'container');
  
  const resolved = runtimeService.resolve('aios.container') as ContainerRuntime;
  assert(resolved.descriptor.capabilities.includes(RuntimeCapability.CONTAINER as any), 'Capabilities should export CONTAINER');
  assert(resolved.descriptor.capabilities.includes(RuntimeCapability.PROCESS_SUPERVISION as any), 'Capabilities should export PROCESS_SUPERVISION');

  const discovered = runtimeService.discovery.findByCapability(RuntimeCapability.CONTAINER as any);
  assert(discovered.length === 1 && discovered[0].runtimeId === 'aios.container', 'Discovered container capability runtime');
  console.log('   ✓ Capability Discovery PASSED');

  console.log('\n==========================================');
  console.log('🎉 ALL CONTAINER PLATFORM TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch((err) => {
  console.error('❌ Tests failed with error:', err);
  process.exit(1);
});
