import { LearningBootstrap } from '../../learning/os/LearningBootstrap';
import { LearningOS } from '../../learning/os/LearningOS';
import { LearningOSState } from '../../learning/os/LearningOSState';
import { ILearningSourceResolver } from '../../learning/source';
import { LearningDataset, LearningRequest, LearningRecord, PatternType } from '../../learning/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`[FAIL] ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running LearningOS Integration Tests ===");

  // Mock data representing GPS tracking sequence
  class MockResolver implements ILearningSourceResolver {
    async resolve(request: LearningRequest): Promise<LearningDataset> {
      const records: LearningRecord[] = [
        { eventId: 'R1', timestamp: '2026-07-01T00:00:00Z', type: 'MOVE' },
        { eventId: 'R2', timestamp: '2026-07-01T00:01:00Z', type: 'MOVE' },
        { eventId: 'R3', timestamp: '2026-07-01T00:02:00Z', type: 'DELIVER' },
        { eventId: 'R4', timestamp: '2026-07-02T00:00:00Z', type: 'MOVE' },
        { eventId: 'R5', timestamp: '2026-07-02T00:01:00Z', type: 'MOVE' },
        { eventId: 'R6', timestamp: '2026-07-02T00:02:00Z', type: 'DELIVER' },
      ];
      return {
        datasetId: 'DS-TEST-001',
        schemaVersion: '1.0.0',
        records,
        createdAt: '2026-07-12T00:00:00Z'
      };
    }
  }

  // 1. Bootstrap the OS
  const { runtime, components, version } = await LearningBootstrap.boot(new MockResolver());
  const os = new LearningOS(runtime, components, version);
  await os.initialize();

  // 2. Check Health & Version
  const health = os.health();
  assertEqual(health.state, LearningOSState.READY, "OS should be READY after boot");
  assertEqual(health.loadedPlugins, 1, "1 plugin loaded");
  assertEqual(health.version.sprint, '9', "Sprint 9 version");

  // 3. Execute Pipeline
  const request: LearningRequest = {
    schemaVersion: '1.0.0',
    requestId: 'REQ-OS-001',
    sourceType: 'API',
    filters: []
  };

  const result = await os.pipeline().run(request);
  assertEqual(result.status, 'SUCCESS', "Pipeline should complete successfully");
  assertEqual(result.patternCount > 0, true, "Patterns should be extracted and APPROVED");

  // Verify that the OS state returned to READY after execution
  assertEqual(os.health().state, LearningOSState.READY, "OS should return to READY after execution");

  // 4. Query the Repository (Facade via QueryService)
  const queryResult = await os.query().query({
    schemaVersion: '1.0.0',
    queryId: 'Q-001',
    patternType: 'SEQUENCE'
  });

  assertEqual(queryResult.patterns.length > 0, true, "Query should return the approved patterns");
  assertEqual(queryResult.patterns[0].status, 'APPROVED', "Repository should only contain APPROVED patterns");
  assertEqual(queryResult.patterns[0].version, 1, "Repository patterns should be version >= 1");

  // 5. Shutdown
  await os.shutdown();
  assertEqual(os.health().state, LearningOSState.SHUTDOWN, "OS should be SHUTDOWN");

  try {
    await os.query().query({ schemaVersion: '1', queryId: '1', patternType: 'SEQUENCE' });
    throw new Error("[FAIL] Query should be blocked in SHUTDOWN");
  } catch(e: any) {
    if (e.message.includes("Cannot execute query")) {
      console.log("[PASS] API calls blocked after shutdown");
    } else throw e;
  }

  console.log("=== All LearningOS Integration tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
