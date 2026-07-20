import { AIEmployeeRegistry } from '../../../aios/workforce/AIEmployeeRegistry';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRegistryStructure() {
  console.log('[Test] AIEmployeeRegistry structural properties starting...');

  const registry: AIEmployeeRegistry = {
    registryId: "reg-111",
    employees: [],
    version: 1,
    metadata: { env: "prod" }
  };

  assert(registry.registryId === "reg-111", "registryId mismatch");
  assert(registry.employees.length === 0, "employees mismatch");
  assert(registry.version === 1, "version mismatch");
  assert((registry.metadata as any).env === "prod", "metadata mismatch");

  console.log('   ✓ AIEmployeeRegistry structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-2: AIEmployeeRegistry Unit Tests ---');
  await testRegistryStructure();
  console.log('--- All G9-2: AIEmployeeRegistry Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
