import { PluginRuntime } from '../../../core/plugin-runtime/PluginRuntime';
import { PluginRuntimeConfig } from '../../../core/plugin-runtime/PluginRuntimeConfig';
import { PluginPermission } from '../../../core/plugin-runtime/PluginPermission';
import { PluginRuntimeError } from '../../../core/plugin-runtime/PluginRuntimeErrors';
import { WorkspaceContextBuilder } from '../../../core/workspace-runtime/WorkspaceContextBuilder';
import { WorkspaceRuntimePreparer } from '../../../core/workspace-runtime/WorkspaceRuntimePreparer';
import { WorkspaceRuntimeTeardown } from '../../../core/workspace-runtime/WorkspaceRuntimeTeardown';
import { WorkspaceLockManager } from '../../../core/workspace-runtime/WorkspaceLockManager';
import { FileLockStorage } from '../../../core/workspace-runtime/FileLockStorage';
import { TempDirectoryManager } from '../../../core/workspace-runtime/TempDirectoryManager';
import { LauncherExecutionRuntime } from '../../../core/launcher-runtime/LauncherExecutionRuntime';
import { LauncherRuntimeRegistry } from '../../../core/launcher-runtime/LauncherRuntimeRegistry';
import { ExecutionSessionManager } from '../../../core/execution-session/ExecutionSessionManager';
import { ISessionIdProvider } from '../../../core/execution-session/ISessionIdProvider';
import * as path from 'path';
import * as fs from 'fs';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const MOCK_WORKSPACE_ROOT = path.join(__dirname, 'mock_plugin_workspace');
const MOCK_ENTRYPOINT = path.join(MOCK_WORKSPACE_ROOT, 'plugin_entry.js');

function setupWorkspace() {
  teardownWorkspace();
  fs.mkdirSync(MOCK_WORKSPACE_ROOT, { recursive: true });
  fs.writeFileSync(
    MOCK_ENTRYPOINT,
    'console.log("Mock Plugin executing..."); console.log("Perms:" + process.env.AIOS_ALLOWED_PERMISSIONS);',
    'utf-8'
  );
}

function teardownWorkspace() {
  if (fs.existsSync(MOCK_WORKSPACE_ROOT)) {
    fs.rmSync(MOCK_WORKSPACE_ROOT, { recursive: true, force: true });
  }
}

class FixedIdProvider implements ISessionIdProvider {
  public generateSessionId(): string {
    return 'plugin-session-uuid-12345';
  }
}

// ==============================================================================
// Test 1: Normal Plugin Run Flow with valid permission mapping
// ==============================================================================
async function testNormalPluginExecution() {
  console.log('[Test 1] Normal plugin execution starting...');
  setupWorkspace();

  const lockStorage = new FileLockStorage();
  const lockManager = new WorkspaceLockManager(lockStorage);
  const tempManager = new TempDirectoryManager();
  const preparer = new WorkspaceRuntimePreparer(lockManager, tempManager);
  const teardown = new WorkspaceRuntimeTeardown(lockManager, tempManager);

  const runtime = new LauncherExecutionRuntime();
  const registry = new LauncherRuntimeRegistry();
  const idProvider = new FixedIdProvider();
  const sessionManager = new ExecutionSessionManager(registry, idProvider);

  const pluginRuntime = new PluginRuntime(preparer, runtime, sessionManager);

  const config: PluginRuntimeConfig = {
    pluginId: 'test-plugin',
    entryPoint: MOCK_ENTRYPOINT,
    allowedPermissions: ['read_file', 'write_file'],
    env: { BASE_KEY: 'abc' }
  };

  try {
    const session = await pluginRuntime.executePlugin(
      config,
      ['read_file', 'write_file'],
      'plugin-session-uuid-12345',
      MOCK_WORKSPACE_ROOT
    );

    assert(session.sessionId === 'plugin-session-uuid-12345', 'Session ID mismatch');
    assert(session.status === 'active', 'Expected active plugin session status');

    // Wait for exit
    await new Promise<void>((resolve) => {
      session.process.onExit(() => resolve());
    });

    assert(session.status === 'completed', `Expected completed status, got: ${session.status}`);
    assert(session.metrics.stdoutLines >= 2, `Expected logs from console, got: ${session.metrics.stdoutLines}`);

    // Teardown workspace context manually to clean files and unlock
    const wsContext = WorkspaceContextBuilder.build(
      'plugin-session-uuid-12345',
      'test-plugin',
      MOCK_WORKSPACE_ROOT
    );
    await teardown.teardown(wsContext);

    console.log('[Test 1] Normal plugin execution: PASSED');
  } finally {
    teardownWorkspace();
  }
}

// ==============================================================================
// Test 2: Plugin Permission Blocked (PLUGIN_PERMISSION_DENIED)
// ==============================================================================
async function testPluginPermissionDenied() {
  console.log('[Test 2] Plugin permission denied check starting...');
  setupWorkspace();

  const lockStorage = new FileLockStorage();
  const lockManager = new WorkspaceLockManager(lockStorage);
  const tempManager = new TempDirectoryManager();
  const preparer = new WorkspaceRuntimePreparer(lockManager, tempManager);

  const runtime = new LauncherExecutionRuntime();
  const registry = new LauncherRuntimeRegistry();
  const idProvider = new FixedIdProvider();
  const sessionManager = new ExecutionSessionManager(registry, idProvider);

  const pluginRuntime = new PluginRuntime(preparer, runtime, sessionManager);

  const config: PluginRuntimeConfig = {
    pluginId: 'test-plugin',
    entryPoint: MOCK_ENTRYPOINT,
    allowedPermissions: ['read_file'] // 'network' is unauthorized
  };

  try {
    let threwError = false;
    try {
      await pluginRuntime.executePlugin(
        config,
        ['read_file', 'network'],
        'session-uuid-999',
        MOCK_WORKSPACE_ROOT
      );
    } catch (err: any) {
      if (err instanceof PluginRuntimeError) {
        threwError = true;
        assert(err.errorCode === 'PLUGIN_PERMISSION_DENIED', 'Expected PLUGIN_PERMISSION_DENIED error code');
      }
    }

    assert(threwError, 'Should throw PluginRuntimeError when unauthorized permissions are requested');
    console.log('[Test 2] Plugin permission denied check: PASSED');
  } finally {
    teardownWorkspace();
  }
}

// ==============================================================================
// Test 3: Entrypoint missing (PLUGIN_ENTRYPOINT_NOT_FOUND)
// ==============================================================================
async function testPluginEntrypointNotFound() {
  console.log('[Test 3] Plugin entrypoint missing check starting...');
  setupWorkspace();

  const lockStorage = new FileLockStorage();
  const lockManager = new WorkspaceLockManager(lockStorage);
  const tempManager = new TempDirectoryManager();
  const preparer = new WorkspaceRuntimePreparer(lockManager, tempManager);

  const runtime = new LauncherExecutionRuntime();
  const registry = new LauncherRuntimeRegistry();
  const idProvider = new FixedIdProvider();
  const sessionManager = new ExecutionSessionManager(registry, idProvider);

  const pluginRuntime = new PluginRuntime(preparer, runtime, sessionManager);

  const config: PluginRuntimeConfig = {
    pluginId: 'test-plugin',
    entryPoint: path.join(MOCK_WORKSPACE_ROOT, 'missing_file.js'),
    allowedPermissions: ['read_file']
  };

  try {
    let threwError = false;
    try {
      await pluginRuntime.executePlugin(
        config,
        ['read_file'],
        'session-uuid-999',
        MOCK_WORKSPACE_ROOT
      );
    } catch (err: any) {
      if (err instanceof PluginRuntimeError) {
        threwError = true;
        assert(err.errorCode === 'PLUGIN_ENTRYPOINT_NOT_FOUND', 'Expected PLUGIN_ENTRYPOINT_NOT_FOUND error code');
      }
    }

    assert(threwError, 'Should throw PluginRuntimeError when entrypoint is missing');
    console.log('[Test 3] Plugin entrypoint missing check: PASSED');
  } finally {
    teardownWorkspace();
  }
}

// ==============================================================================
// Runner
// ==============================================================================
async function runAllTests() {
  console.log('--- Starting Plugin Runtime Foundation Unit Tests ---');
  await testNormalPluginExecution();
  await testPluginPermissionDenied();
  await testPluginEntrypointNotFound();
  console.log('--- All Plugin Runtime Foundation Unit Tests PASSED ---');
}

runAllTests().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
