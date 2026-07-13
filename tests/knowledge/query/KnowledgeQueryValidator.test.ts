import { KnowledgeQueryValidator } from '../../../src/knowledge/query/KnowledgeQueryValidator';

async function runTests() {
  function assertThrows(fn: () => void, expectedMessageSub: string, message: string) {
    try {
      fn();
      throw new Error(`[FAIL] Expected to throw, but completed: ${message}`);
    } catch (e: any) {
      if (e.message.includes(expectedMessageSub)) {
        console.log(`[PASS] ${message} (Threw: ${e.message})`);
      } else {
        throw new Error(`[FAIL] ${message}\nExpected exception containing: "${expectedMessageSub}"\nActual: "${e.message}"`);
      }
    }
  }

  console.log("=== Running KnowledgeQueryValidator Tests ===");

  // 1. Valid Check
  try {
    KnowledgeQueryValidator.validate({
      queryId: 'Q-001',
      schemaVersion: '1.0.0',
      limit: 10,
      offset: 0,
      version: 1
    });
    console.log("[PASS] Valid request passes validation");
  } catch (e: any) {
    throw new Error(`[FAIL] Valid request should have passed: ${e.message}`);
  }

  // 2. Missing queryId
  assertThrows(
    () => KnowledgeQueryValidator.validate({ queryId: '', schemaVersion: '1.0.0' }),
    "queryId is required",
    "Fails when queryId is empty"
  );

  // 3. Limit <= 0
  assertThrows(
    () => KnowledgeQueryValidator.validate({ queryId: 'Q', schemaVersion: '1.0.0', limit: 0 }),
    "limit must be greater than 0",
    "Fails when limit is <= 0"
  );

  // 4. Offset < 0
  assertThrows(
    () => KnowledgeQueryValidator.validate({ queryId: 'Q', schemaVersion: '1.0.0', offset: -1 }),
    "offset must be >= 0",
    "Fails when offset is negative"
  );

  // 5. Version < 1
  assertThrows(
    () => KnowledgeQueryValidator.validate({ queryId: 'Q', schemaVersion: '1.0.0', version: 0 }),
    "version must be >= 1",
    "Fails when version is < 1"
  );

  // 6. Empty strings
  assertThrows(
    () => KnowledgeQueryValidator.validate({ queryId: 'Q', schemaVersion: '1.0.0', knowledgeId: ' ' }),
    "cannot be empty if specified",
    "Fails when knowledgeId is empty spaces"
  );

  console.log("=== All KnowledgeQueryValidator tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
