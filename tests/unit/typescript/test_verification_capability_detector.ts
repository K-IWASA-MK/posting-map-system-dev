/**
 * test_verification_capability_detector.ts
 * 
 * Verification Capability Detector Foundation Unit Test Suite
 */

import {
  APIDetector,
  CDPDetector,
  FilesystemDetector,
  GitDetector,
  VerificationCapabilityDetectorEngine,
  VerificationCapabilityRegistry,
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from '../../../sdk/verification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testCDPDetectorOfflineErrorTranslation() {
  console.log('[Test] CDPDetector Offline Error Translation starting...');

  // Target an unused port to simulate offline CDP endpoint
  const cdpDetector = new CDPDetector({ port: 59999, timeoutMs: 300 });
  const results = await cdpDetector.detect();

  assert(results.length === 2, 'CDPDetector should return 2 results (CDP_ENDPOINT & BROWSER_AUTOMATION)');

  const cdpResult = results.find((r) => r.type === VerificationCapabilityType.CDP_ENDPOINT);
  assert(cdpResult !== undefined, 'CDP_ENDPOINT result missing');
  assert(cdpResult?.status === VerificationCapabilityStatus.UNAVAILABLE, 'Offline CDP endpoint should result in UNAVAILABLE status');
  assert(cdpResult?.metadata?.reason !== undefined, 'Offline CDP result should contain reason metadata');

  const browserResult = results.find((r) => r.type === VerificationCapabilityType.BROWSER_AUTOMATION);
  assert(browserResult?.status === VerificationCapabilityStatus.UNAVAILABLE, 'Offline browser automation should result in UNAVAILABLE status');

  console.log('   ✓ CDPDetector Offline Error Translation: PASSED');
}

async function testGitDetector() {
  console.log('[Test] GitDetector probing starting...');

  const gitDetector = new GitDetector({ cwd: process.cwd() });
  const results = await gitDetector.detect();

  assert(results.length === 1, 'GitDetector should return 1 result');
  const gitResult = results[0];
  assert(gitResult.type === VerificationCapabilityType.GIT_ACCESS, 'Type should be GIT_ACCESS');
  assert(gitResult.status === VerificationCapabilityStatus.AVAILABLE, 'Git should be AVAILABLE in repository');
  assert(gitResult.metadata?.branch !== undefined, 'Git metadata should include branch');

  console.log('   ✓ GitDetector probing: PASSED');
}

async function testFilesystemDetector() {
  console.log('[Test] FilesystemDetector probing starting...');

  const fsDetector = new FilesystemDetector({ workspacePath: process.cwd() });
  const results = await fsDetector.detect();

  assert(results.length === 1, 'FilesystemDetector should return 1 result');
  const fsResult = results[0];
  assert(fsResult.type === VerificationCapabilityType.FILE_ACCESS, 'Type should be FILE_ACCESS');
  assert(fsResult.status === VerificationCapabilityStatus.AVAILABLE, 'Workspace should be AVAILABLE');
  assert(fsResult.metadata?.readable === true, 'Workspace should be readable');
  assert(fsResult.metadata?.writable === true, 'Workspace should be writable');

  console.log('   ✓ FilesystemDetector probing: PASSED');
}

async function testAPIDetectorGeneralization() {
  console.log('[Test] APIDetector generalization starting...');

  // Untested when empty
  const emptyDetector = new APIDetector();
  const emptyResults = await emptyDetector.detect();
  assert(emptyResults[0].status === VerificationCapabilityStatus.UNTESTED, 'Empty APIDetector should return UNTESTED status');

  // Configured endpoints
  const apiDetector = new APIDetector({
    endpoints: [
      { name: 'Local Test Gateway', url: 'http://127.0.0.1:99999/health', timeoutMs: 200 }
    ]
  });

  const configuredResults = await apiDetector.detect();
  assert(configuredResults[0].type === VerificationCapabilityType.API_ACCESS, 'Type should be API_ACCESS');
  assert(configuredResults[0].status === VerificationCapabilityStatus.UNAVAILABLE, 'Unreachable test endpoint should result in UNAVAILABLE status');

  console.log('   ✓ APIDetector generalization: PASSED');
}

async function testDetectorEngineOrchestrationAndSnapshot() {
  console.log('[Test] DetectorEngine Orchestration & Snapshot evidence starting...');
  VerificationCapabilityRegistry.clear();

  const engine = new VerificationCapabilityDetectorEngine({
    detectors: [
      new GitDetector(),
      new FilesystemDetector(),
      new CDPDetector({ port: 59999, timeoutMs: 200 }),
      new APIDetector()
    ]
  });

  const snapshot = await engine.runDetection();

  // Registry populated
  const allRegistered = VerificationCapabilityRegistry.getAll();
  assert(allRegistered.length >= 4, 'Registry should be populated with at least 4 capabilities');

  // Git & File should be AVAILABLE, CDP UNAVAILABLE => overall PARTIAL
  const gitCap = VerificationCapabilityRegistry.findAvailable(VerificationCapabilityType.GIT_ACCESS);
  assert(gitCap.length > 0, 'Git capability should be AVAILABLE in registry');

  const fileCap = VerificationCapabilityRegistry.findAvailable(VerificationCapabilityType.FILE_ACCESS);
  assert(fileCap.length > 0, 'File capability should be AVAILABLE in registry');

  assert(snapshot.overallStatus === 'PARTIAL', 'Overall snapshot status should be PARTIAL (Git/File available, CDP offline)');

  // Snapshot evidence tracked in registry
  const history = VerificationCapabilityRegistry.getSnapshotHistory();
  assert(history.length === 1, 'Snapshot history should have 1 entry');
  assert(history[0].snapshotId === snapshot.snapshotId, 'History should match snapshot');

  console.log('   ✓ DetectorEngine Orchestration & Snapshot evidence: PASSED');
}

async function runAll() {
  console.log('--- Starting Verification Capability Detector Foundation Unit Tests ---');
  await testCDPDetectorOfflineErrorTranslation();
  await testGitDetector();
  await testFilesystemDetector();
  await testAPIDetectorGeneralization();
  await testDetectorEngineOrchestrationAndSnapshot();
  console.log('--- All Verification Capability Detector Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
