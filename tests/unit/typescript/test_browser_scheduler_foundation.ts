import assert from 'assert';
import {
  BrowserSchedulerManager,
  SchedulerState,
  AuthenticationProvider,
  ResumeStrategy,
  ScheduledJob,
  HumanAuthRequest,
  BrowserJobRegistry,
  JobPersistenceManager,
  SchedulerRecoveryManager,
  SchedulerStartedEvent,
  HumanAuthRequestedEvent
} from '../../../sdk/browser/scheduler';
import { BrowserWorkerManager, LockScope, RetryStrategy } from '../../../sdk/browser/worker';

console.log("==================================================");
console.log("   BROWSER SCHEDULER FOUNDATION UNIT TEST SUITE");
console.log("==================================================");

async function runBrowserSchedulerFoundationTests() {
  // Test 1: Scheduler State Lifecycle (STOPPED -> RUNNING -> PAUSED -> STOPPED)
  console.log("\n[Test 1] Scheduler Lifecycle Verification...");
  BrowserSchedulerManager.resetInstance();
  const scheduler = BrowserSchedulerManager.getInstance();

  assert.strictEqual(scheduler.state(), SchedulerState.STOPPED);
  scheduler.start();
  assert.strictEqual(scheduler.state(), SchedulerState.RUNNING);
  scheduler.pause();
  assert.strictEqual(scheduler.state(), SchedulerState.PAUSED);
  scheduler.resume();
  assert.strictEqual(scheduler.state(), SchedulerState.RUNNING);
  scheduler.stop();
  assert.strictEqual(scheduler.state(), SchedulerState.STOPPED);
  console.log("   ✓ Test 1 Passed (Scheduler lifecycle state transitions verified)");

  // Test 2: ScheduledJob Registration & Job Triggering
  console.log("\n[Test 2] ScheduledJob Registration & Job Execution Trigger...");
  scheduler.start();
  const workerMgr = BrowserWorkerManager.getInstance();

  const cronJob: ScheduledJob = {
    jobId: 'job-health-check',
    name: '24/7 Automated Health Check',
    scheduleType: 'CRON',
    cronExpression: '0 * * * *',
    enabled: true,
    taskGenerator: () => ({
      id: 'task-health-001',
      agentId: 'MonitoringAgent',
      priority: 'HIGH',
      scope: LockScope.PAGE,
      targetKey: 'page:/health',
      action: async () => ({ health: 'OK' }),
      state: 'QUEUED',
      enqueuedAt: Date.now(),
      agingScore: 0,
      retryPolicy: { strategy: RetryStrategy.NO_RETRY, maxAttempts: 1, backoffFactorMs: 0 },
      attemptsCount: 1
    })
  };

  scheduler.registerJob(cronJob);
  const triggerSuccess = scheduler['engine'].triggerJob('job-health-check', workerMgr);
  assert.strictEqual(triggerSuccess, true);
  assert.strictEqual(workerMgr.getMetrics().queueLength, 1);
  console.log("   ✓ Test 2 Passed (ScheduledJob registered and triggered into Worker Task Queue)");

  // Test 3: Human Authentication Boundary (WAITING_HUMAN_AUTH -> CEO Notification -> Auto Resume)
  console.log("\n[Test 3] Human Authentication Boundary & WAITING_HUMAN_AUTH Flow...");
  const authReq = await scheduler.requestHumanAuth(
    'TrafficAgent',
    'task-traffic-auth-001',
    'LINE Session Expired',
    AuthenticationProvider.LINE,
    'Scan LINE QR Code on CEO Mobile',
    ResumeStrategy.RESUME_FROM_WAIT
  );

  assert.strictEqual(authReq.agentId, 'TrafficAgent');
  assert.strictEqual(authReq.provider, AuthenticationProvider.LINE);
  assert.strictEqual(authReq.status, 'PENDING');
  assert.strictEqual(scheduler.state(), SchedulerState.PAUSED);

  // CEO completes authentication
  const resumeSuccess = await scheduler.completeHumanAuth(authReq.requestId);
  assert.strictEqual(resumeSuccess, true);
  assert.strictEqual(authReq.status, 'COMPLETED');
  assert.strictEqual(scheduler.state(), SchedulerState.RUNNING);
  console.log("   ✓ Test 3 Passed (Human Auth Request created, PAUSED, and auto-resumed on completion)");

  // Test 4: Crash Recovery Sequence (SchedulerRecoveryManager)
  console.log("\n[Test 4] Crash & Process Reboot Recovery Sequence...");
  const persistenceMgr = new JobPersistenceManager();
  persistenceMgr.saveState(['job-health-check'], [authReq]);

  const recoveryMgr = new SchedulerRecoveryManager(persistenceMgr);
  const recoverySuccess = await recoveryMgr.performRecoverySequence(scheduler);
  assert.strictEqual(recoverySuccess, true);
  console.log("   ✓ Test 4 Passed (Recovery sequence restored state & reconnected runtime)");

  // Test 5: Scheduler Metrics Reporting
  console.log("\n[Test 5] Scheduler Metrics Reporting...");
  const metrics = scheduler.getMetrics();
  assert.ok(typeof metrics.runningJobs === 'number');
  assert.ok(typeof metrics.waitingJobs === 'number');
  assert.ok(typeof metrics.averageTriggerDelayMs === 'number');
  console.log("   ✓ Test 5 Passed (Scheduler metrics structure validated)");

  console.log("\n==================================================");
  console.log("   ALL BROWSER SCHEDULER FOUNDATION TESTS PASSED!");
  console.log("==================================================");
}

runBrowserSchedulerFoundationTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
