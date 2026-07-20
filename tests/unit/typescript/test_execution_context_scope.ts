import { ExecutionContextScope } from '../../../aios/execution/ExecutionContextScope';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionContextScopeStructure() {
  console.log('[Test] ExecutionContextScope properties starting...');

  const scope: ExecutionContextScope = {
    scopeId: "scope-123",
    scopeName: "workspace-active-directory"
  };

  assert(scope.scopeId === "scope-123", "scopeId mismatch");
  assert(scope.scopeName === "workspace-active-directory", "scopeName mismatch");

  console.log('   ✓ ExecutionContextScope properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-4: ExecutionContextScope Unit Tests ---');
  await testExecutionContextScopeStructure();
  console.log('--- All G8-4: ExecutionContextScope Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
