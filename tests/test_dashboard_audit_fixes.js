"use strict";

/**
 * test_dashboard_audit_fixes.js
 * 
 * Dashboard Phase 173 Architecture Audit 修正内容の検証。
 */

const assert = require('assert');

// 1. 擬似 window オブジェクトのモック化
global.window = {};

// 2. 依存スクリプトのロード
require('../src/dashboard/DashboardEventBus.js');
require('../src/dashboard/DashboardWidgetRegistry.js');
require('../src/dashboard/DashboardLayoutRegistry.js');
require('../src/dashboard/DashboardWorkspaceRegistry.js');
require('../src/dashboard/DashboardWorkspaceFactory.js');
require('../src/dashboard/DashboardWorkspaceAdapter.js');
require('../src/dashboard/DashboardStateStore.js');
require('../src/dashboard/DashboardStateManager.js');
require('../src/dashboard/DashboardNavigationRegistry.js');
require('../src/dashboard/DashboardNavigationManager.js');
require('../src/dashboard/DashboardRenderContext.js');
require('../src/dashboard/DashboardRenderingPipeline.js');
require('../src/dashboard/DashboardRuntimeContext.js');
require('../src/dashboard/DashboardRuntimeManager.js');

const widgetRegistry = global.window.DashboardWidgetRegistry;
const renderingPipeline = global.window.DashboardRenderingPipeline;
const workspaceRegistry = global.window.DashboardWorkspaceRegistry;
const workspaceFactory = global.window.DashboardWorkspaceFactory;
const runtimeManager = global.window.DashboardRuntimeManager;
const runtimeContext = global.window.DashboardRuntimeContext;
const stateStore = global.window.DashboardStateStore;
const stateManager = global.window.DashboardStateManager;

try {
  console.log('[Phase 173] Dashboard Architecture Audit Fixes Tests starting...');

  // 1. Widget Priority Sort Verification (MAJOR-001)
  console.log('Testing Widget Priority Sort...');
  widgetRegistry.clear();
  widgetRegistry.register({
    widgetId: 'wdg-low',
    widgetPriority: 999,
    viewModes: ['executive']
  });
  widgetRegistry.register({
    widgetId: 'wdg-high',
    widgetPriority: 1,
    viewModes: ['executive']
  });

  // Clear and setup minimal workspaces and navigations to avoid missing references
  const navRegistry = global.window.DashboardNavigationRegistry;
  navRegistry.clear();
  workspaceRegistry.clear();

  workspaceRegistry.register({
    workspaceId: 'wsp-test-exec',
    layoutId: 'lyt-exec-desktop',
    widgetIds: ['wdg-low', 'wdg-high'],
    viewMode: 'executive'
  });

  navRegistry.register({
    navigationId: 'nav-test-exec',
    viewMode: 'executive',
    workspaceId: 'wsp-test-exec',
    defaultView: true
  });

  // Mock layout to return successfully
  global.window.DashboardLayoutRegistry = {
    getLayout: () => true
  };

  // Execute rendering pipeline
  const resultCtx = renderingPipeline.run('executive', 1200);
  // check that wdg-high is sorted first because of widgetPriority (1 < 999)
  const sorted = resultCtx.widgets;
  assert.strictEqual(sorted[0], 'wdg-high', 'wdg-high should be first due to widgetPriority');
  assert.strictEqual(sorted[1], 'wdg-low', 'wdg-low should be second');
  console.log('Testing Widget Priority Sort: PASSED');

  // 2. Runtime Single Initialization (MAJOR-002)
  console.log('Testing Runtime Single Initialization...');
  // Since we deleted auto-initialization calls from script bottom, checking state store should be uninitialized
  // We can verify that boot() executes stateManager.init() successfully and sets stateVersion to 1,
  // and does not double-reset when called again, or simply verify that state store's version starts at 1
  runtimeManager.boot('executive', 1200);
  const snap = stateManager.getSnapshot();
  assert.strictEqual(snap.stateVersion, 2, 'stateVersion should be 2 after boot completes rendering');
  console.log('Testing Runtime Single Initialization: PASSED');

  // 3. Runtime/Rendering Synchronization (MAJOR-004)
  console.log('Testing Runtime/Rendering Synchronization...');
  const currentBootCtx = runtimeManager.boot('executive', 1200);
  const currentRenderCtx = renderingPipeline.getActiveContext();
  // Verify both active statuses match appropriately (RUNNING/COMPLETED)
  assert.strictEqual(currentBootCtx.runtimeStatus, 'RUNNING');
  assert.strictEqual(currentRenderCtx.renderStatus, 'COMPLETED');
  console.log('Testing Runtime/Rendering Synchronization: PASSED');

  // 4. Responsive Layout (MAJOR-005)
  console.log('Testing Responsive Layout Resolution...');
  workspaceRegistry.clear();
  workspaceRegistry.register({
    workspaceId: 'wsp-test',
    layouts: {
      desktop: 'lyt-desktop',
      tablet: 'lyt-tablet',
      mobile: 'lyt-mobile'
    },
    widgetIds: ['wdg-high', 'wdg-low'],
    viewMode: 'test-view'
  });

  // Mock layout existence
  global.window.DashboardLayoutRegistry = {
    getLayout: (id) => {
      return { layoutId: id };
    }
  };
  global.window.DashboardNavigationRegistry = {
    getNavigationByViewMode: (viewMode) => {
      return {
        navigationId: 'nav-test',
        workspaceId: 'wsp-test',
        viewMode: 'test-view'
      };
    }
  };

  // Run with desktop width
  const ctxDesktop = renderingPipeline.run('test-view', 1200);
  assert.strictEqual(ctxDesktop.layout, 'lyt-desktop');

  // Run with tablet width
  const ctxTablet = renderingPipeline.run('test-view', 800);
  assert.strictEqual(ctxTablet.layout, 'lyt-tablet');

  // Run with mobile width
  const ctxMobile = renderingPipeline.run('test-view', 500);
  assert.strictEqual(ctxMobile.layout, 'lyt-mobile');

  console.log('Testing Responsive Layout Resolution: PASSED');

  // 5. Runtime Determinism (MINOR-001)
  console.log('Testing Runtime Determinism...');
  const rCtx1 = runtimeContext.buildContext();
  const rCtx2 = runtimeContext.buildContext();
  assert.ok(rCtx1.runtimeId.startsWith('rt-'));
  assert.ok(!rCtx1.runtimeId.includes('NaN'));
  assert.notStrictEqual(rCtx1.runtimeId, rCtx2.runtimeId);
  // deterministic check: should be sequential rt-X
  const id1 = parseInt(rCtx1.runtimeId.split('-')[1], 10);
  const id2 = parseInt(rCtx2.runtimeId.split('-')[1], 10);
  assert.strictEqual(id2, id1 + 1, 'runtime IDs should be sequential (deterministic)');
  console.log('Testing Runtime Determinism: PASSED');

  // 6. Workspace Determinism (MINOR-002)
  console.log('Testing Workspace Determinism...');
  // Restore normal LayoutRegistry and WidgetRegistry mock
  global.window.DashboardLayoutRegistry = {
    getLayout: () => true
  };
  global.window.DashboardWidgetRegistry = {
    getWidget: () => true
  };

  const ws1 = workspaceFactory.createWorkspace({ workspaceId: 'test-ws' });
  const ws2 = workspaceFactory.createWorkspace({ workspaceId: 'test-ws' });
  assert.ok(ws1.instanceId.startsWith('winst-test-ws-'));
  const instId1 = parseInt(ws1.instanceId.split('-')[3], 10);
  const instId2 = parseInt(ws2.instanceId.split('-')[3], 10);
  assert.strictEqual(instId2, instId1 + 1, 'workspace instance IDs should be sequential (deterministic)');
  console.log('Testing Workspace Determinism: PASSED');

  // 7. State Validation (MINOR-003)
  console.log('Testing State Validation...');
  // Valid state should succeed
  stateStore.initialize({
    stateVersion: 1,
    currentWorkspace: 'wsp-exec',
    renderStatus: 'init'
  });
  assert.strictEqual(stateStore.getState().stateVersion, 1);

  // Missing stateVersion should fail
  assert.throws(() => {
    stateStore.setState({
      currentWorkspace: 'wsp-exec',
      renderStatus: 'init'
    });
  }, /Missing required state field: stateVersion/);

  // Missing currentWorkspace should fail
  assert.throws(() => {
    stateStore.setState({
      stateVersion: 1,
      renderStatus: 'init'
    });
  }, /Missing required state field: currentWorkspace/);

  // Missing renderStatus should fail
  assert.throws(() => {
    stateStore.setState({
      stateVersion: 1,
      currentWorkspace: 'wsp-exec'
    });
  }, /Missing required state field: renderStatus/);

  console.log('Testing State Validation: PASSED');

  console.log('\nAll Phase 173 verification tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('\nTest execution failed:', err);
  process.exit(1);
}
