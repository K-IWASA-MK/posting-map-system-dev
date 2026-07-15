import { PluginLifecycleManager } from '../../../../../sdk/core/plugin/PluginLifecycleManager';
import { DevelopmentPluginStatus } from '../../../../../sdk/core/plugin/DevelopmentPluginStatus';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running PluginLifecycleManager tests...');

  // Test 1: Allowed transition
  let allowed = PluginLifecycleManager.canTransition(DevelopmentPluginStatus.UNLOADED, DevelopmentPluginStatus.DISCOVERED);
  assert(allowed, 'UNLOADED -> DISCOVERED should be allowed');

  // Will not throw
  PluginLifecycleManager.validateTransition(DevelopmentPluginStatus.INITIALIZED, DevelopmentPluginStatus.READY);
  PluginLifecycleManager.validateTransition(DevelopmentPluginStatus.READY, DevelopmentPluginStatus.RUNNING);
  PluginLifecycleManager.validateTransition(DevelopmentPluginStatus.RUNNING, DevelopmentPluginStatus.COMPLETED);
  PluginLifecycleManager.validateTransition(DevelopmentPluginStatus.COMPLETED, DevelopmentPluginStatus.DISPOSED);

  // Test 2: Denied transition
  let denied = !PluginLifecycleManager.canTransition(DevelopmentPluginStatus.UNLOADED, DevelopmentPluginStatus.RUNNING);
  assert(denied, 'UNLOADED -> RUNNING should be denied');

  let threwError = false;
  try {
    PluginLifecycleManager.validateTransition(DevelopmentPluginStatus.LOADED, DevelopmentPluginStatus.COMPLETED);
  } catch (e) {
    threwError = true;
  }
  assert(threwError, 'Should throw error on invalid transition LOADED -> COMPLETED');

  // Test 3: Same state transition
  let sameAllowed = PluginLifecycleManager.canTransition(DevelopmentPluginStatus.READY, DevelopmentPluginStatus.READY);
  assert(sameAllowed, 'Same state transition should be allowed or ignored');

  console.log('All PluginLifecycleManager tests passed!');
}

runTests();
