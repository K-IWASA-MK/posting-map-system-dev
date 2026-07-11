"use strict";

/**
 * test_dashboard_rendering.js
 * 
 * Dashboard Rendering Pipeline Foundation 用の Node.js 単体テスト。
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
require('../src/dashboard/DashboardRenderAdapter.js');
require('../src/dashboard/components/DashboardRenderingCard.js');

const contextBuilder = global.window.DashboardRenderContext;
const pipeline = global.window.DashboardRenderingPipeline;
const adapter = global.window.DashboardRenderAdapter;
const card = global.window.DashboardRenderingCard;
const eventBus = global.window.DashboardEventBus;
const stateManager = global.window.DashboardStateManager;

try {
  // Test 1: Context 作成および不変化検証 (pipelineId / pipelineVersion 含む)
  console.log('[Test 1] Render Context Object.freeze validation starting...');
  const testCtx = contextBuilder.buildContext({
    workspace: 'wsp-test',
    pipelineId: 'test-pipe',
    pipelineVersion: 'v1.5'
  });
  assert.ok(testCtx);
  assert.ok(Object.isFrozen(testCtx));
  assert.strictEqual(testCtx.workspace, 'wsp-test');
  assert.strictEqual(testCtx.pipelineId, 'test-pipe');
  assert.strictEqual(testCtx.pipelineVersion, 'v1.5');
  assert.throws(() => {
    testCtx.pipelineVersion = 'v2.0';
  }, TypeError);
  console.log('[Test 1] Render Context Object.freeze validation: PASSED');

  // Test 2 & Test 4: パイプライン状態遷移、不適合例外バリデーション、およびイベント発行検証
  console.log('[Test 2 & 4] Pipeline run, validation and Event triggering starting...');
  let eventFired = false;
  let eventPayload = null;
  eventBus.on('dashboard-render-complete', (payload) => {
    eventFired = true;
    eventPayload = payload;
  });

  const contextSnapshot = pipeline.run('executive', 1200);
  assert.strictEqual(contextSnapshot.renderStatus, 'COMPLETED');
  assert.strictEqual(contextSnapshot.workspace, 'wsp-executive');
  assert.strictEqual(contextSnapshot.layout, 'lyt-exec-desktop');
  assert.strictEqual(contextSnapshot.viewport, 'desktop');

  // イベント通知の検証
  assert.ok(eventFired);
  assert.strictEqual(eventPayload.renderStatus, 'COMPLETED');

  // 不正なレイアウト指定時の例外検証
  assert.throws(() => {
    global.window.DashboardWorkspaceRegistry.register({
      workspaceId: 'wsp-invalid',
      layoutId: 'lyt-not-exist',
      widgetIds: []
    });
    global.window.DashboardNavigationRegistry.register({
      navigationId: 'nav-invalid',
      viewMode: 'invalid',
      workspaceId: 'wsp-invalid'
    });
    pipeline.run('invalid', 1200);
  }, /Invalid layout referenced/);
  console.log('[Test 2 & 4] Pipeline run, validation and Event triggering: PASSED');

  // Test 3: 優先度（priority）順の決定論的ソート検証
  console.log('[Test 3] Queue sorting by widget priority starting...');
  // wsp-executive の構成ウィジェット ID リスト: ['wdg-kpi', 'wdg-history', 'wdg-evidence', 'wdg-audit']
  // 各優先度: wdg-kpi (1), wdg-history (2), wdg-evidence (3), wdg-audit (4)
  const ctxObj = pipeline.run('executive', 1200);
  const queue = ctxObj.widgets;
  assert.deepStrictEqual(Array.from(queue), ['wdg-kpi', 'wdg-history', 'wdg-evidence', 'wdg-audit']);
  console.log('[Test 3] Queue sorting by widget priority: PASSED');

  // Test 5: Adapter ViewModel 変換検証
  console.log('[Test 5] Adapter VM validation starting...');
  const vm = adapter.getDashboardRenderData();
  assert.ok(vm);
  assert.ok(Object.isFrozen(vm));
  assert.strictEqual(vm.renderStatus, 'COMPLETED');
  assert.strictEqual(vm.currentWorkspace, 'wsp-executive');
  assert.strictEqual(vm.widgetQueueCount, 4);
  assert.ok(Object.isFrozen(vm.widgetQueue));
  console.log('[Test 5] Adapter VM validation: PASSED');

  // Test 6: Observer Boundary (操作UIおよびAI関連キーワードの不在検証)
  console.log('[Test 6] Observer boundary checks starting...');
  const html = card.render({ renderData: vm });

  // AI 予測・推薦・最適化・自動描画・自動配置などの文言チェック
  const forbiddenKeywords = ['予測', '推薦', '最適化', '自動描画', '自動配置', '自動判断'];
  forbiddenKeywords.forEach(kw => {
    assert.ok(!html.includes(kw), `Forbidden keyword found: ${kw}`);
  });

  // 操作ボタンや入力コントロールの不在チェック
  const interactiveTags = ['<button', '<input', '<select', '<form', '<textarea'];
  interactiveTags.forEach(tag => {
    assert.ok(!html.includes(tag), `Interactive element tag found: ${tag}`);
  });
  console.log('[Test 6] Observer boundary checks: PASSED');

  console.log('All Dashboard Rendering Pipeline tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
