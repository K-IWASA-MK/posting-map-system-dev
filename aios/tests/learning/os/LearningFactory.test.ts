import { LearningFactory } from '../../learning/os/LearningFactory';
import { ILearningSourceResolver } from '../../learning/source';
import { LearningDataset, LearningRequest } from '../../learning/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running LearningFactory Tests ===");

  class MockResolver implements ILearningSourceResolver {
    async resolve(request: LearningRequest): Promise<LearningDataset> {
      return { datasetId: 'DS1', schemaVersion: '1', records: [], createdAt: '2026-07-12T00:00:00Z' };
    }
  }

  const components = LearningFactory.createComponents(new MockResolver());

  assertEqual(components.pipeline !== undefined, true, "Pipeline created");
  assertEqual(components.queryService !== undefined, true, "QueryService created");
  assertEqual(components.loadedPluginsCount, 1, "Should load Sequence plugin");
  assertEqual(components.loadedPoliciesCount, 1, "Should load Sequence policy");

  console.log("=== All LearningFactory tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
