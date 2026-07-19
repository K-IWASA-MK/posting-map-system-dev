import { ObservabilityRuntime } from '../../../sdk/core/observability/ObservabilityRuntime';
import { TelemetryPipeline } from '../../../sdk/core/observability/pipeline/TelemetryPipeline';
import { 
  AlertRule, 
  AlertSeverity, 
  ObservabilityRecord, 
  PlatformHealthStatus 
} from '../../../sdk/core/observability/ObservabilityRecord';
import { ConsoleRegistry } from '../../../sdk/core/console/ConsoleRegistry';
import { DefaultConsolePolicy } from '../../../sdk/core/console/ConsolePolicy';
import { AIOSEventBus } from '../../../sdk/core/event/AIOSEventBus';
import { AIOSEvent } from '../../../sdk/core/event/AIOSEvent';
import { RuntimeHealthStatus } from '../../../sdk/core/runtime/RuntimeHealth';
import { RuntimeState } from '../../../sdk/core/runtime/RuntimeState';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// 1. Alert Rule definition with Cooldown
const sampleAlertRules: AlertRule[] = [
  {
    ruleId: 'RULE-ERR-001',
    condition: (record: ObservabilityRecord) => record.severity === 'ERROR',
    severity: AlertSeverity.ERROR,
    cooldown: 1000, // 1 second cooldown
    enabled: true
  }
];

async function testTelemetryPipelineStages() {
  console.log('[Test 1] Telemetry Pipeline Stages starting...');
  const eventBus = new AIOSEventBus();
  const obsRuntime = new ObservabilityRuntime(eventBus, sampleAlertRules);
  await obsRuntime.initialize({
    runtimeId: 'aios.observability',
    workspaceId: 'ws-test',
    executionId: 'exec-test',
    traceId: 'trace-test',
    configuration: {},
    services: {}
  });

  // Process a normal event
  const event: AIOSEvent = {
    eventId: 'EVT-TEST-1',
    eventType: 'RuntimeStarted',
    eventVersion: '1.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.validation',
    correlationId: 'CORR-1',
    causationId: 'CAUS-1',
    payload: { executionId: 'exec-1', traceId: 'trace-1' },
    state: RuntimeState.RUNNING
  };

  obsRuntime.forceProcessEvent(event);

  const proj = obsRuntime.getProjection();
  assert(proj !== null, 'Projection should not be null');
  assert(proj.platformHealth === PlatformHealthStatus.HEALTHY, 'Platform health should be HEALTHY');
  assert(proj.metrics !== null, 'Metrics should be updated');
  assert(proj.metrics.runtimeCount === 1, 'Runtime count should be 1');
  assert(proj.metrics.runtimeStates['aios.validation'] === RuntimeState.RUNNING, 'Validation state should be RUNNING');
  console.log('[Test 1] Telemetry Pipeline Stages: PASSED');
}

async function testHealthAggregation() {
  console.log('[Test 2] Health Aggregation starting...');
  const eventBus = new AIOSEventBus();
  // We trigger an error to observe health state changes
  const obsRuntime = new ObservabilityRuntime(eventBus, sampleAlertRules);

  const errorEvent: AIOSEvent = {
    eventId: 'EVT-ERR-1',
    eventType: 'ValidationErrorOccurred',
    eventVersion: '1.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.validation',
    correlationId: 'CORR-2',
    causationId: 'CAUS-2',
    payload: { message: 'Verification error', error: true, traceId: 'trace-2' }
  };

  obsRuntime.forceProcessEvent(errorEvent);

  const proj = obsRuntime.getProjection();
  console.log('[DEBUG] platformHealth:', proj.platformHealth, 'metrics:', JSON.stringify(proj.metrics), 'alerts:', JSON.stringify(proj.activeAlerts));
  // Mapped platform status should degrade when failures are processed
  assert(proj.platformHealth === PlatformHealthStatus.UNHEALTHY, 'Platform health should degrade to UNHEALTHY on errors');
  console.log('[Test 2] Health Aggregation: PASSED');
}

async function testAlertRulesAndCooldowns() {
  console.log('[Test 3] Alert Rules and Cooldowns starting...');
  const eventBus = new AIOSEventBus();
  const obsRuntime = new ObservabilityRuntime(eventBus, sampleAlertRules);

  const errorEvent: AIOSEvent = {
    eventId: 'EVT-ERR-2',
    eventType: 'RuntimeError',
    eventVersion: '1.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.validation',
    correlationId: 'CORR-3',
    causationId: 'CAUS-3',
    payload: { message: 'Verification failed' }
  };

  // Fire first alert
  obsRuntime.forceProcessEvent(errorEvent);
  let proj = obsRuntime.getProjection();
  assert(proj.activeAlerts.length === 1, 'First alert should be logged');

  // Fire immediately again (cooldown should block it)
  obsRuntime.forceProcessEvent(errorEvent);
  proj = obsRuntime.getProjection();
  assert(proj.activeAlerts.length === 1, 'Alert count should remain 1 due to cooldown check');

  // Wait for cooldown (1.1s)
  await new Promise(resolve => setTimeout(resolve, 1100));

  // Fire after cooldown
  obsRuntime.forceProcessEvent(errorEvent);
  proj = obsRuntime.getProjection();
  assert(proj.activeAlerts.length === 2, 'Alert count should increase after cooldown elapsed');
  console.log('[Test 3] Alert Rules and Cooldowns: PASSED');
}

async function testExecutionLedgerTraceAssociation() {
  console.log('[Test 4] Execution Ledger Trace Association starting...');
  const eventBus = new AIOSEventBus();
  const obsRuntime = new ObservabilityRuntime(eventBus);

  const traceEvent: AIOSEvent = {
    eventId: 'EVT-TRACE-1',
    eventType: 'ExecutionTriggered',
    eventVersion: '1.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.plugin',
    correlationId: 'CORR-4',
    causationId: 'CAUS-4',
    payload: { 
      traceId: 'trace-999', 
      runId: 'ledger-888', 
      executionId: 'exec-777', 
      duration: 350, 
      overallStatus: 'PASS' 
    }
  };

  obsRuntime.forceProcessEvent(traceEvent);
  const proj = obsRuntime.getProjection();
  const trace = proj.traces.find((t: any) => t.traceId === 'trace-999');

  assert(trace !== undefined, 'Trace should be present');
  assert(trace.ledgerId === 'ledger-888', 'LedgerId should match');
  assert(trace.executionId === 'exec-777', 'ExecutionId should match');
  assert(trace.duration === 350, 'Duration should be recorded');
  assert(trace.status === 'success', 'Status should be success');
  console.log('[Test 4] Execution Ledger Trace Association: PASSED');
}

async function testConsoleProjectionOnlyRead() {
  console.log('[Test 5] Console Projection Only Read starting...');
  const eventBus = new AIOSEventBus();
  const obsRuntime = new ObservabilityRuntime(eventBus);
  const consoleRegistry = new ConsoleRegistry(DefaultConsolePolicy);

  // Connect Console to Observability Projection
  consoleRegistry.setObservabilityRuntime(obsRuntime);

  // Trigger metrics update in Observability
  const event: AIOSEvent = {
    eventId: 'EVT-CONN-1',
    eventType: 'RuntimeStarted',
    eventVersion: '1.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.console',
    correlationId: 'CORR-5',
    causationId: 'CAUS-5',
    payload: { traceId: 'trace-console' }
  };
  obsRuntime.forceProcessEvent(event);

  // Read via ConsoleRegistry
  const consoleRuntimes = consoleRegistry.getRuntimes();
  assert(consoleRuntimes.length === 1, 'ConsoleRegistry should query Observability projection');
  assert(consoleRuntimes[0].runtimeId === 'aios.console', 'Mismatched runtime in projected read model');

  const metrics = consoleRegistry.getMetrics();
  assert(metrics.runtimeMetrics.runtimeCount === 1, 'ConsoleRegistry metrics should align with Observability');
  console.log('[Test 5] Console Projection Only Read: PASSED');
}

async function testEdgeCases() {
  console.log('[Test 6] Edge Cases (Telemetry missing & empty projection) starting...');
  const eventBus = new AIOSEventBus();
  const obsRuntime = new ObservabilityRuntime(eventBus);

  // A. Empty Projection
  const emptyProj = obsRuntime.getProjection();
  assert(emptyProj.platformHealth === PlatformHealthStatus.UNKNOWN, 'Platform state should be UNKNOWN initially');
  assert(emptyProj.metrics === null, 'Metrics should be null when empty');
  assert(emptyProj.activeAlerts.length === 0, 'No alerts should exist');
  assert(emptyProj.traces.length === 0, 'No traces should exist');

  // B. Telemetry missing / empty payload
  const emptyPayloadEvent: AIOSEvent = {
    eventId: 'EVT-EMPTY',
    eventType: 'SomeUnknownEvent',
    eventVersion: '1.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.unknown',
    correlationId: 'CORR-EMPTY',
    causationId: 'CAUS-EMPTY',
    payload: null as any
  };

  let threw = false;
  try {
    obsRuntime.forceProcessEvent(emptyPayloadEvent);
  } catch (err) {
    threw = true;
  }
  assert(!threw, 'TelemetryPipeline should degrade gracefully on empty payload/events');
  console.log('[Test 6] Edge Cases (Telemetry missing & empty projection): PASSED');
}

async function runAll() {
  console.log('--- Starting Observability Runtime Foundation Unit Tests ---');
  await testTelemetryPipelineStages();
  await testHealthAggregation();
  await testAlertRulesAndCooldowns();
  await testExecutionLedgerTraceAssociation();
  await testConsoleProjectionOnlyRead();
  await testEdgeCases();
  console.log('--- All Observability Runtime Foundation Unit Tests PASSED ---');
}

runAll().catch(err => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
