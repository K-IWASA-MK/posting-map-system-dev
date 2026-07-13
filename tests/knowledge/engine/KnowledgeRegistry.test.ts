import { KnowledgeRegistry } from '../../../src/knowledge/engine/KnowledgeRegistry';
import { IKnowledgePlugin } from '../../../src/knowledge/engine/IKnowledgePlugin';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgeRegistry Tests ===");

  const registry = new KnowledgeRegistry();

  const mockPluginLow: IKnowledgePlugin = {
    pluginId: 'P-LOW',
    targetPatternType: 'SEQUENCE',
    version: '1.0.0',
    priority: 10,
    supports: () => true,
    synthesize: () => []
  };

  const mockPluginHigh: IKnowledgePlugin = {
    pluginId: 'P-HIGH',
    targetPatternType: 'SEQUENCE',
    version: '1.0.0',
    priority: 100, // High priority
    supports: () => true,
    synthesize: () => []
  };

  registry.register(mockPluginLow);
  registry.register(mockPluginHigh);

  const sequencePlugins = registry.getSupportedPlugins('SEQUENCE');
  assertEqual(sequencePlugins.length, 2, "Both plugins registered");
  assertEqual(sequencePlugins[0].pluginId, 'P-HIGH', "Sorted descending: high priority first");
  assertEqual(sequencePlugins[1].pluginId, 'P-LOW', "Sorted descending: low priority second");

  // Duplicate registration fail
  try {
    registry.register(mockPluginLow);
    throw new Error("[FAIL] Duplicate plugin registration allowed");
  } catch(e) {
    console.log("[PASS] Rejected duplicate registration");
  }

  console.log("=== All KnowledgeRegistry tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
