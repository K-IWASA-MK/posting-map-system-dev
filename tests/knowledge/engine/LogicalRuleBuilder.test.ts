import { LogicalRuleBuilder } from '../../knowledge/engine/LogicalRuleBuilder';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running LogicalRuleBuilder Tests ===");

  const rule = LogicalRuleBuilder.create('R1', 'GUARD', 'p1')
    .parameter('key1', 'value1')
    .parameter('key2', { nested: 'obj' })
    .build();

  assertEqual(rule.ruleId, 'R1', "ruleId matches");
  assertEqual(rule.ruleType, 'GUARD', "ruleType matches");
  assertEqual(rule.pluginId, 'p1', "pluginId matches");
  assertEqual(rule.parameters['key1'], 'value1', "string parameter saved");
  assertEqual((rule.parameters['key2'] as any).nested, 'obj', "nested object parameter saved");

  // Immutability checks
  assertEqual(Object.isFrozen(rule), true, "Rule is frozen");
  assertEqual(Object.isFrozen(rule.parameters), true, "Parameters map is frozen");
  assertEqual(Object.isFrozen(rule.parameters['key2']), true, "Nested object inside parameters is frozen");

  try {
    (rule as any).ruleId = 'new';
    throw new Error("[FAIL] Modify ruleId allowed");
  } catch(e) {
    console.log("[PASS] Modifying rule properties is blocked");
  }

  try {
    (rule.parameters as any).key1 = 'new';
    throw new Error("[FAIL] Modify parameters allowed");
  } catch(e) {
    console.log("[PASS] Modifying rule parameters is blocked");
  }

  console.log("=== All LogicalRuleBuilder tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
