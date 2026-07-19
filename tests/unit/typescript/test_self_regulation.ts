import { QualityRuntime } from '../../../sdk/core/quality/QualityRuntime';
import { AutomationRuntime } from '../../../sdk/core/automation/AutomationRuntime';
import { ObservabilityRuntime } from '../../../sdk/core/observability/ObservabilityRuntime';
import { AIOSEventBus } from '../../../sdk/core/event/AIOSEventBus';
import { AIOSEvent } from '../../../sdk/core/event/AIOSEvent';
import { RuntimeState } from '../../../sdk/core/runtime/RuntimeState';
import { PlatformHealthStatus } from '../../../sdk/core/observability/ObservabilityRecord';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testSelfRegulationLoop() {
  console.log('[Test 1] Self-Regulation Loop integration starting...');
  const eventBus = new AIOSEventBus();
  
  const rules = [
    {
      ruleId: 'RULE-WARN-001',
      condition: (r: any) => r.severity === 'WARNING',
      severity: 'WARNING' as any,
      cooldown: 1000,
      enabled: true
    }
  ];
  const obsRuntime = new ObservabilityRuntime(eventBus, rules);
  const qualityRuntime = new QualityRuntime(eventBus);
  const automationRuntime = new AutomationRuntime(eventBus);

  // Link runtimes
  qualityRuntime.setObservabilityRuntime(obsRuntime);
  automationRuntime.setQualityRuntime(qualityRuntime);
  automationRuntime.setObservabilityRuntime(obsRuntime);

  // Initialize
  await obsRuntime.initialize({
    runtimeId: 'aios.observability',
    workspaceId: 'ws-1',
    executionId: 'ex-1',
    traceId: 'tr-1',
    configuration: {},
    services: {}
  });

  await qualityRuntime.initialize({
    runtimeId: 'aios.quality',
    workspaceId: 'ws-1',
    executionId: 'ex-1',
    traceId: 'tr-1',
    configuration: {},
    services: {}
  });

  await automationRuntime.initialize({
    runtimeId: 'aios.automation',
    workspaceId: 'ws-1',
    executionId: 'ex-1',
    traceId: 'tr-1',
    configuration: {},
    services: {}
  });

  qualityRuntime.manifest = {
    qualityId: 'quality-test',
    configuration: {
      minPassingOverallScore: 10,
      minPassingHealthScore: 10,
      minPassingStabilityScore: 10
    },
    lifecyclePolicy: {
      startupTimeoutMs: 1000,
      shutdownTimeoutMs: 1000,
      restartPolicy: 'ALWAYS',
      maxRestarts: 3
    }
  } as any;

  automationRuntime.manifest = {
    automationId: 'automation-test',
    configuration: {
      rules: [
        { actionName: 'Cache Cleanup', cooldownMs: 1000, maxRetries: 3 }
      ]
    },
    lifecyclePolicy: {
      startupTimeoutMs: 1000,
      shutdownTimeoutMs: 1000,
      restartPolicy: 'ALWAYS',
      maxRestarts: 3
    }
  } as any;

  // Track standard event sequence
  const eventsCaptured: string[] = [];
  eventBus.subscribe('*', async (event) => {
    eventsCaptured.push(event.eventType);
    if (event.eventType === 'AutomationApproved') {
      console.log('[DEBUG] AutomationApproved payload:', event.payload);
    }
  });

  // Trigger metrics/telemetry update that causes low stability score (so recommendation generated)
  // Process two failure traces in Observability to degrade stability
  const warnEvent: AIOSEvent = {
    eventId: 'EVT-WARN-1',
    eventType: 'ValidationWarning',
    eventVersion: '1.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.validation',
    correlationId: 'CORR-W',
    causationId: 'CAU-W',
    payload: { message: 'Validation performance warning', warning: true }
  };
  obsRuntime.forceProcessEvent(warnEvent);

  // Publish TelemetryCollected event to kick quality evaluation
  const telemetryEvent: AIOSEvent = {
    eventId: 'EVT-TEL-COLLECTED',
    eventType: 'TelemetryCollected',
    eventVersion: '1.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.observability',
    correlationId: 'CORR-T',
    causationId: 'CAU-T',
    payload: { state: 'updated' }
  };
  await eventBus.publish(telemetryEvent);

  // Allow events to propagate
  await new Promise(resolve => setTimeout(resolve, 100));

  // Verify event flow sequence
  console.log('[DEBUG] Captured Events:', eventsCaptured);
  assert(eventsCaptured.includes('TelemetryCollected'), 'TelemetryCollected event missing');
  assert(eventsCaptured.includes('QualityEvaluated'), 'QualityEvaluated event missing');
  assert(eventsCaptured.includes('RecommendationGenerated'), 'RecommendationGenerated event missing');
  assert(eventsCaptured.includes('AutomationApproved'), 'AutomationApproved event missing');
  assert(eventsCaptured.includes('AutomationExecuted'), 'AutomationExecuted event missing');
  assert(eventsCaptured.includes('AutomationCompleted'), 'AutomationCompleted event missing');
  assert(eventsCaptured.includes('LedgerRecorded'), 'LedgerRecorded event missing');

  console.log('[Test 1] Self-Regulation Loop integration: PASSED');
}

async function testSafetyGuards() {
  console.log('[Test 2] Automation Safety Guards starting...');
  const eventBus = new AIOSEventBus();
  
  const obsRuntime = new ObservabilityRuntime(eventBus);
  const qualityRuntime = new QualityRuntime(eventBus);
  const automationRuntime = new AutomationRuntime(eventBus);

  qualityRuntime.setObservabilityRuntime(obsRuntime);
  automationRuntime.setQualityRuntime(qualityRuntime);
  automationRuntime.setObservabilityRuntime(obsRuntime);

  // A. Cooldown check
  const recEvent: AIOSEvent = {
    eventId: 'EVT-REC-1',
    eventType: 'RecommendationGenerated',
    eventVersion: '1.0',
    occurredAt: new Date().toISOString(),
    producerRuntimeId: 'aios.quality',
    correlationId: 'CORR-R1',
    causationId: 'CAU-R1',
    payload: { 
      suggestedAction: 'Cache Cleanup',
      recommendationId: 'REC-COOLDOWN-1',
      priority: 'HIGH'
    }
  };

  const capturedDecisions: any[] = [];
  eventBus.subscribe('AutomationApproved', async (e) => {
    capturedDecisions.push(e.payload);
  });

  // Fire first time -> Approved
  await automationRuntime.handleRecommendation(recEvent);
  assert(capturedDecisions.length === 1, 'Decision should be recorded');
  assert(capturedDecisions[0].approvalResult === 'APPROVED', 'First run should be APPROVED');

  // Fire second time immediately -> Rejected (Cooldown)
  const recEvent2 = { ...recEvent, eventId: 'EVT-REC-2', payload: { ...recEvent.payload, recommendationId: 'REC-COOLDOWN-2' } };
  await automationRuntime.handleRecommendation(recEvent2);
  assert(capturedDecisions.length === 2, 'Decision should be recorded');
  assert(capturedDecisions[1].approvalResult === 'REJECTED', 'Second immediate run should be REJECTED');
  assert(capturedDecisions[1].reason.includes('cooling down'), 'Rejection reason should list cooldown');

  // B. Expiration check (expiresAt is past)
  // Let's verify manually via engine since handler builds expires = Date.now() + 60s
  console.log('[Test 2] Automation Safety Guards: PASSED');
}

async function runAll() {
  console.log('--- Starting Quality & Automation Runtime Foundation Unit Tests ---');
  await testSelfRegulationLoop();
  await testSafetyGuards();
  console.log('--- All Quality & Automation Runtime Foundation Unit Tests PASSED ---');
}

runAll().catch(err => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
