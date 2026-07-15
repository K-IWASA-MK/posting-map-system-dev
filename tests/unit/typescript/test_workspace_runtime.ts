import { WorkspaceContext } from '../../../core/workspace-runtime/WorkspaceContext';
import { WorkspaceContextBuilder } from '../../../core/workspace-runtime/WorkspaceContextBuilder';
import { ILockStorage } from '../../../core/workspace-runtime/ILockStorage';
import { FileLockStorage } from '../../../core/workspace-runtime/FileLockStorage';
import { WorkspaceLockManager } from '../../../core/workspace-runtime/WorkspaceLockManager';
import { TempDirectoryManager } from '../../../core/workspace-runtime/TempDirectoryManager';
import { WorkspaceRuntimePreparer } from '../../../core/workspace-runtime/WorkspaceRuntimePreparer';
import { WorkspaceRuntimeTeardown } from '../../../core/workspace-runtime/WorkspaceRuntimeTeardown';
import { WorkspaceRuntimeError } from '../../../core/workspace-runtime/WorkspaceRuntimeErrors';
import * as path from 'path';
import * as fs from 'fs';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const MOCK_WORKSPACE_ROOT = path.join(__dirname, 'mock_project_workspace');

function setupWorkspace() {
  teardownWorkspace();
  fs.mkdirSync(MOCK_WORKSPACE_ROOT, { recursive: true });
}

function teardownWorkspace() {
  if (fs.existsSync(MOCK_WORKSPACE_ROOT)) {
    fs.rmSync(MOCK_WORKSPACE_ROOT, { recursive: true, force: true });
  }
}

// Memory-based Lock Storage implementation for testing pluggability
class MemoryLockStorage implements ILockStorage {
  private readonly locks = new Map<string, string>();

  public exists(lockFilePath: string): boolean {
    return this.locks.has(lockFilePath);
  }

  public write(lockFilePath: string, content: string): void {
    this.locks.set(lockFilePath, content);
  }

  public delete(lockFilePath: string): void {
    this.locks.delete(lockFilePath);
  }
}

// ==============================================================================
// Test 1: Normal Workspace Prep and Teardown Flow
// ==============================================================================
async function testNormalPrepTeardown() {
  console.log('[Test 1] Normal prep and teardown starting...');
  setupWorkspace();

  const lockStorage = new FileLockStorage();
  const lockManager = new WorkspaceLockManager(lockStorage);
  const tempManager = new TempDirectoryManager();
  const preparer = new WorkspaceRuntimePreparer(lockManager, tempManager);
  const teardown = new WorkspaceRuntimeTeardown(lockManager, tempManager);

  const context = WorkspaceContextBuilder.build(
    'session-123',
    'posting-map',
    MOCK_WORKSPACE_ROOT,
    { CUSTOM_KEY: 'val' }
  );

  try {
    assert(context.sessionId === 'session-123', 'Session ID mismatch');
    assert(context.envBindings.CUSTOM_KEY === 'val', 'Custom env bindings mismatch');
    assert(context.envBindings.AIOS_SESSION_ID === 'session-123', 'Injected session ID env mismatch');

    // Prepare
    await preparer.prepare(context);

    assert(fs.existsSync(context.tempPath), 'Temp directory should be created');
    assert(fs.existsSync(context.lockFilePath), 'Lock file should exist');
    assert(lockManager.isLocked(context.lockFilePath) === true, 'Lock manager should report locked');

    // Create a dummy file in temp directory
    const dummyFile = path.join(context.tempPath, 'dummy.txt');
    fs.writeFileSync(dummyFile, 'hello', 'utf-8');

    // Teardown
    await teardown.teardown(context);

    assert(!fs.existsSync(context.lockFilePath), 'Lock file should be deleted on teardown');
    assert(lockManager.isLocked(context.lockFilePath) === false, 'Lock manager should report unlocked');
    assert(!fs.existsSync(dummyFile), 'Dummy files inside temp directory should be cleaned up');

    console.log('[Test 1] Normal prep and teardown: PASSED');
  } finally {
    teardownWorkspace();
  }
}

// ==============================================================================
// Test 2: Double Lock Blocking (WORKSPACE_LOCKED)
// ==============================================================================
async function testDoubleLockBlocking() {
  console.log('[Test 2] Double lock blocking starting...');
  setupWorkspace();

  const lockStorage = new FileLockStorage();
  const lockManager = new WorkspaceLockManager(lockStorage);
  const tempManager = new TempDirectoryManager();
  const preparer = new WorkspaceRuntimePreparer(lockManager, tempManager);

  const context1 = WorkspaceContextBuilder.build('session-1', 'posting-map', MOCK_WORKSPACE_ROOT);
  const context2 = WorkspaceContextBuilder.build('session-2', 'posting-map', MOCK_WORKSPACE_ROOT);

  try {
    await preparer.prepare(context1);

    let threwError = false;
    try {
      await preparer.prepare(context2);
    } catch (err: any) {
      if (err instanceof WorkspaceRuntimeError) {
        threwError = true;
        assert(err.errorCode === 'WORKSPACE_LOCKED', 'Expected WORKSPACE_LOCKED error code');
      }
    }

    assert(threwError, 'Should throw WorkspaceRuntimeError when workspace is already locked');
    console.log('[Test 2] Double lock blocking: PASSED');
  } finally {
    // Manually delete lock
    lockStorage.delete(context1.lockFilePath);
    teardownWorkspace();
  }
}

// ==============================================================================
// Test 3: Pluggable Lock Storage
// ==============================================================================
async function testPluggableLockStorage() {
  console.log('[Test 3] Pluggable Lock Storage starting...');
  const memoryStorage = new MemoryLockStorage();
  const lockManager = new WorkspaceLockManager(memoryStorage);
  const tempManager = new TempDirectoryManager();

  const preparer = new WorkspaceRuntimePreparer(lockManager, tempManager);
  const context = WorkspaceContextBuilder.build('session-999', 'posting-map', MOCK_WORKSPACE_ROOT);

  // We don't setup directory because memory lock storage does not touch filesystem
  try {
    const success = await lockManager.acquireLock(context.lockFilePath, context.sessionId);
    assert(success === true, 'Should acquire memory lock');
    assert(memoryStorage.exists(context.lockFilePath) === true, 'Memory lock storage should reflect active lock');
    assert(lockManager.isLocked(context.lockFilePath) === true, 'Lock manager should report locked');

    await lockManager.releaseLock(context.lockFilePath);
    assert(memoryStorage.exists(context.lockFilePath) === false, 'Memory lock storage should clear lock');
    assert(lockManager.isLocked(context.lockFilePath) === false, 'Lock manager should report unlocked');

    console.log('[Test 3] Pluggable Lock Storage: PASSED');
  } finally {
    teardownWorkspace();
  }
}

// ==============================================================================
// Runner
// ==============================================================================
async function runAllTests() {
  console.log('--- Starting Workspace Runtime Foundation Unit Tests ---');
  await testNormalPrepTeardown();
  await testDoubleLockBlocking();
  await testPluggableLockStorage();
  console.log('--- All Workspace Runtime Foundation Unit Tests PASSED ---');
}

runAllTests().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
