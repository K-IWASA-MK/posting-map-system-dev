"use strict";

/**
 * test_dashboard_state.js
 * 
 * Dashboard State Manager Foundation 用の Node.js 単体テスト。
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
require('../src/dashboard/DashboardStateAdapter.js');
require('../src/dashboard/components/DashboardStateCard.js');

const stateStore = global.window.DashboardStateStore;
const stateManager = global.window.DashboardStateManager;
const stateAdapter = global.window.DashboardStateAdapter;
const stateCard = global.window.DashboardStateCard;
const eventBus = global.window.DashboardEventBus;

try {
  // 明示的な初期化（自動初期化が廃止されたため）
  stateManager.init();

  // Test 1: 初期状態の Object.freeze 不変性検証
  console.log('[Test 1] Initial state Object.freeze validation starting...');
  const snapshot = stateManager.getSnapshot();
  assert.ok(snapshot);
  assert.ok(Object.isFrozen(snapshot));
  assert.ok(Object.isFrozen(snapshot.widgetStates));
  assert.throws(() => {
    snapshot.currentWorkspace = "wsp-mutated";
  }, TypeError);
  console.log('[Test 1] Initial state Object.freeze validation: PASSED');

  // Test 2: 初期状態プロパティ値の検証
  console.log('[Test 2] Initial State values validation starting...');
  assert.strictEqual(snapshot.currentWorkspace, 'wsp-executive');
  assert.strictEqual(snapshot.currentView, 'executive');
  assert.strictEqual(snapshot.currentLayout, 'lyt-exec-desktop');
  assert.strictEqual(snapshot.initialized, true);
  assert.strictEqual(snapshot.renderStatus, 'rendered');
  assert.strictEqual(snapshot.stateVersion, 1);
  assert.ok(snapshot.lastUpdated);
  console.log('[Test 2] Initial State values validation: PASSED');

  // Test 3 & Test 6: 状態更新＆不変化、および EventBus 同期通知の検証
  console.log('[Test 3 & 6] State updates & Event notification starting...');
  let eventFired = false;
  let eventPayload = null;
  eventBus.on('dashboard-state-update', (payload) => {
    eventFired = true;
    eventPayload = payload;
  });

  const nextState = stateManager.updateState({
    currentWorkspace: 'wsp-operations',
    currentView: 'operations',
    renderStatus: 'idle'
  });

  // 更新内容の確認
  assert.strictEqual(nextState.currentWorkspace, 'wsp-operations');
  assert.strictEqual(nextState.currentView, 'operations');
  assert.strictEqual(nextState.renderStatus, 'idle');
  // バージョン・時刻メタデータの自動更新確認
  assert.strictEqual(nextState.stateVersion, 2);
  assert.ok(nextState.lastUpdated);
  assert.ok(Object.isFrozen(nextState));

  // イベント通知の確認
  assert.ok(eventFired);
  assert.strictEqual(eventPayload.stateVersion, 2);
  assert.strictEqual(eventPayload.currentWorkspace, 'wsp-operations');
  console.log('[Test 3 & 6] State updates & Event notification: PASSED');

  // Test 4: スナップショット取得の検証
  console.log('[Test 4] Snapshot generation starting...');
  const snap = stateManager.getSnapshot();
  assert.strictEqual(snap.stateVersion, 2);
  assert.strictEqual(snap.currentWorkspace, 'wsp-operations');
  console.log('[Test 4] Snapshot generation: PASSED');

  // Test 5: Adapter ViewModel 変換検証 (stateVersion, lastUpdated等を含む)
  console.log('[Test 5] Adapter VM validation starting...');
  const vm = stateAdapter.getDashboardStateData();
  assert.ok(vm);
  assert.ok(Object.isFrozen(vm));
  assert.strictEqual(vm.currentWorkspace, 'wsp-operations');
  assert.strictEqual(vm.stateVersion, 2);
  assert.strictEqual(vm.widgetCount, 5); // Widget Registryに事前登録されたコアウィジェット数 (5件)
  console.log('[Test 5] Adapter VM validation: PASSED');

  // Test 7: Observer Boundary (操作UIおよびAI関連キーワードの不在検証)
  console.log('[Test 7] Observer boundary checks starting...');
  const html = stateCard.render({ stateData: vm });

  // AI 予測・推薦・最適化・自動更新・自動判断などの文言チェック
  const forbiddenKeywords = ['予測', '推薦', '最適化', '自動配置', '自動更新', '自動判断'];
  forbiddenKeywords.forEach(kw => {
    assert.ok(!html.includes(kw), `Forbidden keyword found: ${kw}`);
  });

  // 操作ボタンや入力コントロールの不在チェック
  const interactiveTags = ['<button', '<input', '<select', '<form', '<textarea'];
  interactiveTags.forEach(tag => {
    assert.ok(!html.includes(tag), `Interactive element tag found: ${tag}`);
  });
  console.log('[Test 7] Observer boundary checks: PASSED');

  console.log('All Dashboard State Manager tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
