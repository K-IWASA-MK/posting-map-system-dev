import { RuntimeService } from '../../../sdk/core/runtime/service/RuntimeService';
import { RuntimeRegistry } from '../../../sdk/core/runtime/registry/RuntimeRegistry';
import { IRuntime } from '../../../sdk/core/runtime/IRuntime';
import { RuntimeDescriptor } from '../../../sdk/core/runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../../../sdk/core/runtime/RuntimeCapability';
import { RuntimeHealth, RuntimeHealthStatus } from '../../../sdk/core/runtime/RuntimeHealth';
import { RuntimeState } from '../../../sdk/core/runtime/RuntimeState';
import { AIOSEventBus } from '../../../sdk/core/event/AIOSEventBus';
import { AIOSEvent } from '../../../sdk/core/event/AIOSEvent';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// Mock Runtime implementation for testing
class MockRuntime implements IRuntime {
  public id: string;
  public version: string;
  public descriptor: RuntimeDescriptor;
  public manifest?: any;

  public initializeCalled = false;
  public startCalled = false;
  public stopCalled = false;
  public validateCalled = false;

  constructor(id: string, capabilities: RuntimeCapability[] = []) {
    this.id = id;
    this.version = '1.0.0';
    this.descriptor = {
      runtimeId: id,
      runtimeName: `Mock ${id}`,
      version: '1.0.0',
      contractVersion: '1.0',
      capabilities,
      dependencies: []
    };
  }

  public async getHealth(): Promise<RuntimeHealth> {
    return this.health();
  }

  public health(): RuntimeHealth {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString(),
      reason: 'Mock is healthy',
      lastChecked: new Date().toISOString(),
      message: 'Mock is healthy'
    };
  }

  public async initialize(): Promise<void> {
    this.initializeCalled = true;
  }

  public async validate(manifest: any): Promise<void> {
    this.validateCalled = true;
    if (manifest && manifest.failValidation) {
      throw new Error('Mock Validation Failed');
    }
  }

  public async execute(): Promise<void> {}
  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}
  public async shutdown(): Promise<void> {}

  public async start(): Promise<void> {
    this.startCalled = true;
  }

  public async stop(): Promise<void> {
    this.stopCalled = true;
  }
}

async function testRegistrationAndEvents() {
  console.log('[Test 1] Registration and Events starting...');
  const eventBus = new AIOSEventBus();
  const service = new RuntimeService(eventBus);
  const publishedEvents: AIOSEvent[] = [];

  eventBus.subscribe('*', async (event) => {
    if (event.eventType.startsWith('Runtime')) {
      publishedEvents.push(event);
    }
  });

  const mock = new MockRuntime('aios.test-service', [RuntimeCapability.AUTOMATION]);
  await service.register(mock, 'automation');

  const state = service.getState('aios.test-service');
  assert(state === RuntimeState.REGISTERED, 'State should be REGISTERED');

  const registeredEvent = publishedEvents.find(e => e.eventType === 'RuntimeRegistered');
  assert(registeredEvent !== undefined, 'RuntimeRegistered event should be published');
  assert(registeredEvent!.runtimeId === 'aios.test-service', 'Event runtimeId mismatch');
  assert(registeredEvent!.state === RuntimeState.REGISTERED, 'Event state mismatch');
  assert(registeredEvent!.timestamp !== undefined, 'Event timestamp missing');
  console.log('[Test 1] Registration and Events: PASSED');
}

async function testDiscovery() {
  console.log('[Test 2] Discovery starting...');
  const eventBus = new AIOSEventBus();
  const service = new RuntimeService(eventBus);

  const mock1 = new MockRuntime('aios.test-service1', [RuntimeCapability.AUTOMATION]);
  const mock2 = new MockRuntime('aios.test-service2', [RuntimeCapability.MONITORING]);
  await service.register(mock1, 'automation');
  await service.register(mock2, 'observability');

  const all = service.discovery.discover();
  assert(all.length === 2, 'Should discover 2 runtimes');

  const autoRuntimes = service.discovery.findByType('automation');
  assert(autoRuntimes.length === 1, 'Should find 1 automation runtime');
  assert(autoRuntimes[0].runtimeId === 'aios.test-service1', 'Automation runtimeId mismatch');

  const monRuntimes = service.discovery.findByCapability(RuntimeCapability.MONITORING);
  assert(monRuntimes.length === 1, 'Should find 1 monitoring capability runtime');
  assert(monRuntimes[0].runtimeId === 'aios.test-service2', 'Monitoring runtimeId mismatch');
  console.log('[Test 2] Discovery: PASSED');
}

async function testLifecycleTransitions() {
  console.log('[Test 3] Lifecycle Transitions starting...');
  const eventBus = new AIOSEventBus();
  const service = new RuntimeService(eventBus);
  const publishedEvents: AIOSEvent[] = [];

  eventBus.subscribe('*', async (event) => {
    publishedEvents.push(event);
  });

  const mock = new MockRuntime('aios.test-lifecycle');
  await service.register(mock);

  // Initialize
  await service.initializeRuntime('aios.test-lifecycle');
  assert(mock.initializeCalled === true, 'initialize should be called on mock');
  assert(service.getState('aios.test-lifecycle') === RuntimeState.READY, 'State should be READY');
  assert(publishedEvents.some(e => e.eventType === 'RuntimeReady' && e.state === RuntimeState.READY), 'RuntimeReady event missing');

  // Start
  await service.startRuntime('aios.test-lifecycle');
  assert(mock.startCalled === true, 'start should be called on mock');
  assert(service.getState('aios.test-lifecycle') === RuntimeState.RUNNING, 'State should be RUNNING');
  assert(publishedEvents.some(e => e.eventType === 'RuntimeStarted' && e.state === RuntimeState.RUNNING), 'RuntimeStarted event missing');

  // Stop
  await service.stopRuntime('aios.test-lifecycle');
  assert(mock.stopCalled === true, 'stop should be called on mock');
  assert(service.getState('aios.test-lifecycle') === RuntimeState.STOPPED, 'State should be STOPPED');
  assert(publishedEvents.some(e => e.eventType === 'RuntimeStopped' && e.state === RuntimeState.STOPPED), 'RuntimeStopped event missing');
  console.log('[Test 3] Lifecycle Transitions: PASSED');
}

async function testOrchestration() {
  console.log('[Test 4] Orchestration starting...');
  const eventBus = new AIOSEventBus();
  const service = new RuntimeService(eventBus);

  const mock = new MockRuntime('aios.test-orchestration');
  await service.register(mock);

  // Activate
  await service.activateRuntime('aios.test-orchestration');
  assert(service.getState('aios.test-orchestration') === RuntimeState.RUNNING, 'Should transition to RUNNING after activate');

  // Deactivate
  await service.deactivateRuntime('aios.test-orchestration');
  assert(service.getState('aios.test-orchestration') === RuntimeState.STOPPED, 'Should transition to STOPPED after deactivate');
  console.log('[Test 4] Orchestration: PASSED');
}

async function testActiveValidation() {
  console.log('[Test 5] Active Validation starting...');
  const eventBus = new AIOSEventBus();
  const service = new RuntimeService(eventBus);

  const validationMock = new MockRuntime('aios.validation', [RuntimeCapability.VALIDATION]);
  await service.register(validationMock, 'validation');

  const validMock = new MockRuntime('aios.valid-runtime');
  const invalidMock = new MockRuntime('aios.invalid-runtime');
  invalidMock.manifest = { failValidation: true };

  // Registering valid runtime should succeed
  await service.register(validMock, 'generic');
  assert(validationMock.validateCalled === true, 'Validation check should be triggered');

  // Registering invalid runtime should fail and propagate error
  let threw = false;
  try {
    await service.register(invalidMock, 'generic');
  } catch (err: any) {
    threw = true;
    assert(err.message.includes('Validation failed'), 'Error message mismatch');
  }
  assert(threw, 'Should throw registration validation error');
  console.log('[Test 5] Active Validation: PASSED');
}

async function runAll() {
  console.log('--- Starting Runtime Service Foundation Unit Tests ---');
  await testRegistrationAndEvents();
  await testDiscovery();
  await testLifecycleTransitions();
  await testOrchestration();
  await testActiveValidation();
  console.log('--- All Runtime Service Foundation Unit Tests PASSED ---');
}

runAll().catch(err => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
