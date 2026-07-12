import { LearningOSState } from '../../../src/learning/os/LearningOSState';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running LearningOSState Tests ===");
  assertEqual(LearningOSState.BOOTING, 'BOOTING', "BOOTING state");
  assertEqual(LearningOSState.READY, 'READY', "READY state");
  assertEqual(LearningOSState.RUNNING, 'RUNNING', "RUNNING state");
  assertEqual(LearningOSState.SHUTDOWN, 'SHUTDOWN', "SHUTDOWN state");
  assertEqual(LearningOSState.ERROR, 'ERROR', "ERROR state");
  console.log("=== All LearningOSState tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
