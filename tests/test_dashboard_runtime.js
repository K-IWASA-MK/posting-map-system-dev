"use strict";

/**
 * test_dashboard_runtime.js
 * 
 * Dashboard Runtime Foundation 用の Node.js 単体テスト。
 */

const assert = require('assert');

// 1. 擬似 window オブジェクトのモック化
global.window = {};

// 2. 依存スクリプトのロード
require('../src/dashboard/DashboardEventBus.js');

require('../src/dashboard/DashboardWidgetRegistry.js');
require('../src/dashboard/DashboardLayoutRegistry.js');
require('../src/dashboard/DashboardWorkspaceRegistry.js');
require('../src/dashboard/DashboardStateStore.js');
require('../src/dashboard/DashboardStateManager.js');
require('../src/dashboard/DashboardNavigationRegistry.js');
require('../src/dashboard/DashboardNavigationManager.js');
require('../src/dashboard/DashboardRenderContext.js');
require('../src/dashboard/DashboardRenderingPipeline.js');
require('../src/dashboard/DashboardRuntimeContext.js');
require('../src/dashboard/DashboardRuntimeManager.js');
require('../src/dashboard/DashboardRuntimeAdapter.js');
require('../src/dashboard/components/DashboardRuntimeCard.js');

const contextBuilder = global.window.DashboardRuntimeContext;
const runtimeManager = global.window.DashboardRuntimeManager;
const adapter = global.window.DashboardRuntimeAdapter;
const card = global.window.DashboardRuntimeCard;
const eventBus = global.window.DashboardEventBus;

try {
  // Test 1: Runtime Context Object.freeze() 検証
  console.log('[Test 1] Runtime Context Object.freeze validation starting...');
  const testCtx = contextBuilder.buildContext({
    runtimeStatus: 'CREATED'
  });
  assert.ok(testCtx);
  assert.ok(Object.isFrozen(testCtx));
  assert.ok(Object.isFrozen(testCtx.initializedModules));
  assert.ok(Object.isFrozen(testCtx.initializationOrder));
  assert.throws(() => {
    testCtx.runtimeStatus = 'BOOTING';
  }, TypeError);
  console.log('[Test 1] Runtime Context Object.freeze validation: PASSED');

  // Test 2 & Test 4: Boot シーケンス状態遷移、および EventBus 同期通知の検証
  console.log('[Test 2 & 4] Boot sequencing & Event triggering starting...');
  
  const events = [];
  eventBus.on('dashboard-runtime-booting', () => events.push('BOOTING'));
  eventBus.on('dashboard-runtime-initializing', () => events.push('INITIALIZING'));
  eventBus.on('dashboard-runtime-ready', () => events.push('READY'));
  eventBus.on('dashboard-runtime-running', () => events.push('RUNNING'));

  const activeCtx = runtimeManager.boot();
  assert.strictEqual(activeCtx.runtimeStatus, 'RUNNING');
  assert.ok(activeCtx.bootTimestamp);

  // イベント順序・発火の検証
  assert.ok(events.includes('BOOTING'));
  assert.ok(events.includes('INITIALIZING'));
  assert.ok(events.includes('READY'));
  assert.ok(events.includes('RUNNING'));
  console.log('[Test 2 & 4] Boot sequencing & Event triggering: PASSED');

  // Test 3: 初期化完了モジュールリストの整合性検証
  console.log('[Test 3] Initialized modules checking starting...');
  const list = activeCtx.initializedModules;
  assert.ok(list.includes('DashboardWidgetRegistry'));
  assert.ok(list.includes('DashboardLayoutRegistry'));
  assert.ok(list.includes('DashboardWorkspaceRegistry'));
  assert.ok(list.includes('DashboardStateManager'));
  assert.ok(list.includes('DashboardNavigationManager'));
  assert.ok(list.includes('DashboardRenderingPipeline'));
  console.log('[Test 3] Initialized modules checking: PASSED');

  // Test 5: Adapter ViewModel 変換検証
  console.log('[Test 5] Adapter VM validation starting...');
  const vm = adapter.getDashboardRuntimeData();
  assert.ok(vm);
  assert.ok(Object.isFrozen(vm));
  assert.strictEqual(vm.runtimeStatus, 'RUNNING');
  assert.strictEqual(vm.initializedModulesCount, 6);
  assert.ok(Object.isFrozen(vm.initializedModules));
  assert.ok(vm.bootDurationMs >= 0);
  console.log('[Test 5] Adapter VM validation: PASSED');

  // Test 6: Observer Boundary (操作UIおよびAI関連キーワードの不在検証)
  console.log('[Test 6] Observer boundary checks starting...');
  const html = card.render({ runtimeData: vm });

  // AI 予測・推薦・最適化・自己修復・自動再起動などの文言チェック
  const forbiddenKeywords = ['予測', '推薦', '最適化', '自己修復', '自動再起動', '自動判断'];
  forbiddenKeywords.forEach(kw => {
    assert.ok(!html.includes(kw), `Forbidden keyword found: ${kw}`);
  });

  // 操作ボタンや入力コントロールの不在チェック
  const interactiveTags = ['<button', '<input', '<select', '<form', '<textarea'];
  interactiveTags.forEach(tag => {
    assert.ok(!html.includes(tag), `Interactive element tag found: ${tag}`);
  });
  console.log('[Test 6] Observer boundary checks: PASSED');

  console.log('All Dashboard Runtime tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
