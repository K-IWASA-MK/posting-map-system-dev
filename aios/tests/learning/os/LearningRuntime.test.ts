import { LearningRuntime } from '../../learning/os/LearningRuntime';
import { LearningOSState } from '../../learning/os/LearningOSState';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running LearningRuntime Tests ===");

  const runtime = new LearningRuntime();
  assertEqual(runtime.state, LearningOSState.BOOTING, "Initial state should be BOOTING");

  runtime.transitionTo(LearningOSState.READY);
  assertEqual(runtime.state, LearningOSState.READY, "Transition to READY");

  let executed = false;
  await runtime.runSafely(async () => {
    executed = true;
    assertEqual(runtime.state, LearningOSState.RUNNING, "State should be RUNNING inside runSafely");
  });
  
  assertEqual(executed, true, "Operation was executed");
  assertEqual(runtime.state, LearningOSState.READY, "State should return to READY after success");

  try {
    await runtime.runSafely(async () => {
      throw new Error("Simulated failure");
    });
  } catch(e) {}
  
  assertEqual(runtime.state, LearningOSState.READY, "State should return to READY even if operation fails");

  runtime.transitionTo(LearningOSState.ERROR, "Fatal system error");
  assertEqual(runtime.state, LearningOSState.ERROR, "Transition to ERROR");
  assertEqual(runtime.lastError, "Fatal system error", "Error message recorded");

  try {
    runtime.transitionTo(LearningOSState.SHUTDOWN);
    throw new Error("[FAIL] Should not allow transition from ERROR");
  } catch(e: any) {
    if (e.message.includes("Cannot transition from ERROR")) {
      console.log("[PASS] Rejected transition from ERROR");
    } else throw e;
  }

  console.log("=== All LearningRuntime tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
