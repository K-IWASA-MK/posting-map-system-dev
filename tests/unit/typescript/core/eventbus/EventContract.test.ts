import { 
  ExecutionStartedPayload, 
  ExecutionCompletedPayload,
  SystemBootPayload 
} from '../../../../../sdk/core/eventbus/EventContract';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running EventContract tests...');

  // Verification 1: ExecutionStarted payload type alignment
  const execStart: ExecutionStartedPayload = {
    executionId: 'EXEC-99',
    contextId: 'CTX-99',
    triggerSource: 'UserRequest'
  };
  assert(execStart.executionId === 'EXEC-99', 'Payload property executionId should align');

  // Verification 2: ExecutionCompleted payload type alignment
  const execComplete: ExecutionCompletedPayload = {
    executionId: 'EXEC-99',
    durationMs: 450,
    status: 'PASS'
  };
  assert(execComplete.status === 'PASS', 'Status should match string union contract');

  // Verification 3: SystemBoot payload type alignment
  const boot: SystemBootPayload = {
    aiosVersion: '1.0.0',
    bootTime: new Date().toISOString()
  };
  assert(boot.aiosVersion === '1.0.0', 'System Version should be matching');

  console.log('All EventContract tests passed!');
}

runTests();
