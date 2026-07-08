"use strict";

/**
 * test_dashboard_navigation.js
 * 
 * Dashboard Navigation Foundation 用の Node.js 単体テスト。
 */

const assert = require('assert');

// 1. 擬似 window オブジェクトのモック化
global.window = {};

// 2. 依存スクリプトのロード
require('../src/dashboard/DashboardEventBus.js');
// グローバル EventBus が自動的に初期化されていることを前提にロード

require('../src/dashboard/DashboardWidgetRegistry.js');
require('../src/dashboard/DashboardLayoutRegistry.js');
require('../src/dashboard/DashboardWorkspaceRegistry.js');
require('../src/dashboard/DashboardStateStore.js');
require('../src/dashboard/DashboardStateManager.js');
require('../src/dashboard/DashboardNavigationRegistry.js');
require('../src/dashboard/DashboardNavigationManager.js');
require('../src/dashboard/DashboardNavigationAdapter.js');
require('../src/dashboard/components/DashboardNavigationCard.js');

const navRegistry = global.window.DashboardNavigationRegistry;
const navManager = global.window.DashboardNavigationManager;
const navAdapter = global.window.DashboardNavigationAdapter;
const navCard = global.window.DashboardNavigationCard;
const eventBus = global.window.DashboardEventBus;
const stateManager = global.window.DashboardStateManager;

try {
  // Test 1: Navigation Registry Object.freeze 不変性検証
  console.log('[Test 1] Navigation Registry Object.freeze validation starting...');
  const routes = navRegistry.getAllNavigations();
  assert.ok(routes.length > 0);
  assert.ok(Object.isFrozen(routes));
  assert.ok(Object.isFrozen(routes[0]));
  assert.ok(Object.isFrozen(routes[0].breadcrumb));

  assert.throws(() => {
    routes[0].navigationName = "MUTATED";
  }, TypeError);

  assert.throws(() => {
    routes[0].breadcrumb.push("Next Chain");
  }, TypeError);
  console.log('[Test 1] Navigation Registry Object.freeze validation: PASSED');

  // Test 2: ViewMode ⇔ Route ルーティング解決および Breadcrumb / defaultView 検証
  console.log('[Test 2] ViewMode ⇔ Route matching starting...');
  const execNav = navRegistry.getNavigationByViewMode('executive');
  assert.strictEqual(execNav.navigationId, 'nav-executive');
  assert.strictEqual(execNav.route, '/executive');
  assert.strictEqual(execNav.defaultView, true);
  assert.deepStrictEqual(Array.from(execNav.breadcrumb), ['Dashboard', 'Executive Summary']);

  // 不正なクエリ時のデフォルトフォールバック動作
  const fallback = navRegistry.getNavigationByViewMode('invalid-view');
  assert.strictEqual(fallback.navigationId, 'nav-executive');
  console.log('[Test 2] ViewMode ⇔ Route matching: PASSED');

  // Test 3 & Test 4: ナビゲーション画面遷移、StateManager同期、および EventBus 同期通知
  console.log('[Test 3 & 4] Active Navigation & State Manager sync starting...');
  
  let eventFired = false;
  let eventPayload = null;
  eventBus.on('dashboard-navigation-change', (payload) => {
    eventFired = true;
    eventPayload = payload;
  });

  const targetNav = navManager.navigateTo('operations');
  assert.strictEqual(targetNav.navigationId, 'nav-operations');
  assert.strictEqual(navManager.getActiveNavigation().navigationId, 'nav-operations');

  // StateManager 状態同期の検証
  const snap = stateManager.getSnapshot();
  assert.strictEqual(snap.currentWorkspace, 'wsp-operations');
  assert.strictEqual(snap.currentView, 'operations');
  
  // EventBus 同期通知の検証
  assert.ok(eventFired);
  assert.strictEqual(eventPayload.navigationId, 'nav-operations');
  console.log('[Test 3 & 4] Active Navigation & State Manager sync: PASSED');

  // Test 5: Adapter ViewModel 変換検証 (breadcrumbs等含む)
  console.log('[Test 5] Adapter VM validation starting...');
  const vm = navAdapter.getDashboardNavigationData();
  assert.ok(vm);
  assert.ok(Object.isFrozen(vm));
  assert.ok(Object.isFrozen(vm.navigations));
  assert.ok(Object.isFrozen(vm.breadcrumbs));
  assert.strictEqual(vm.activeNavId, 'nav-operations');
  assert.deepStrictEqual(Array.from(vm.breadcrumbs), ['Dashboard', 'Live Operations']);

  const activeVMItem = vm.navigations.find(n => n.navigationId === 'nav-operations');
  assert.strictEqual(activeVMItem.isActive, true);
  console.log('[Test 5] Adapter VM validation: PASSED');

  // Test 6: Observer Boundary (操作UIおよびAI関連キーワードの不在検証)
  console.log('[Test 6] Observer boundary checks starting...');
  const html = navCard.render({ navigations: vm.navigations, activeNavId: vm.activeNavId });

  // AI 予測・推薦・最適化・自動遷移・自動判断などの文言チェック
  const forbiddenKeywords = ['予測', '推薦', '最適化', '自動遷移', '自動判断'];
  forbiddenKeywords.forEach(kw => {
    assert.ok(!html.includes(kw), `Forbidden keyword found: ${kw}`);
  });

  // 操作ボタンや入力コントロールの不在チェック
  const interactiveTags = ['<button', '<input', '<select', '<form', '<textarea'];
  interactiveTags.forEach(tag => {
    assert.ok(!html.includes(tag), `Interactive element tag found: ${tag}`);
  });
  console.log('[Test 6] Observer boundary checks: PASSED');

  console.log('All Dashboard Navigation tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
