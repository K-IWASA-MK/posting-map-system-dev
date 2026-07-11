"use strict";

/**
 * test_dashboard_workspace.js
 * 
 * Dashboard Workspace Foundation 用の Node.js 単体テスト。
 */

const assert = require('assert');

// 1. 擬似 window オブジェクトのモック化
global.window = {};

// 2. 依存スクリプトのロード
require('../src/dashboard/DashboardWidgetRegistry.js');
require('../src/dashboard/DashboardLayoutRegistry.js');
require('../src/dashboard/DashboardWorkspaceRegistry.js');
require('../src/dashboard/DashboardWorkspaceFactory.js');
require('../src/dashboard/DashboardWorkspaceAdapter.js');
require('../src/dashboard/components/DashboardWorkspaceCard.js');

const workspaceRegistry = global.window.DashboardWorkspaceRegistry;
const workspaceFactory = global.window.DashboardWorkspaceFactory;
const workspaceAdapter = global.window.DashboardWorkspaceAdapter;
const workspaceCard = global.window.DashboardWorkspaceCard;

try {
  // Test 1: Workspace Registry Object.freeze 不変性検証
  console.log('[Test 1] Workspace Registry Object.freeze validation starting...');
  const workspaces = workspaceRegistry.getAllWorkspaces();
  assert.ok(workspaces.length > 0);
  assert.ok(Object.isFrozen(workspaces));
  assert.ok(Object.isFrozen(workspaces[0]));
  assert.ok(Object.isFrozen(workspaces[0].widgetIds));

  assert.throws(() => {
    workspaces[0].workspaceName = "MUTATED";
  }, TypeError);

  assert.throws(() => {
    workspaces[0].widgetIds.push("wdg-new");
  }, TypeError);
  console.log('[Test 1] Workspace Registry Object.freeze validation: PASSED');

  // Test 2: Workspace Factory 仕様バリデーション・生成検証
  console.log('[Test 2] Workspace Factory spec validation starting...');
  const spec = workspaceRegistry.getWorkspace('wsp-executive');
  assert.ok(spec);

  const instance = workspaceFactory.createWorkspace(spec);
  assert.strictEqual(instance.workspaceId, 'wsp-executive');
  assert.strictEqual(instance.status, 'active');
  assert.ok(Object.isFrozen(instance));
  assert.ok(Object.isFrozen(instance.metadata));

  // バリデーションチェック: 存在しない layoutId
  assert.throws(() => {
    workspaceFactory.createWorkspace({
      workspaceId: 'wsp-invalid-layout',
      layoutId: 'lyt-not-exist',
      widgetIds: []
    });
  }, /Referenced layoutId does not exist/);

  // バリデーションチェック: 存在しない widgetId
  assert.throws(() => {
    workspaceFactory.createWorkspace({
      workspaceId: 'wsp-invalid-widget',
      layoutId: 'lyt-exec-desktop',
      widgetIds: ['wdg-non-existent']
    });
  }, /Referenced widgetId does not exist/);
  console.log('[Test 2] Workspace Factory spec validation: PASSED');

  // Test 3: Workspace ➔ Layout / Widget / viewMode マッピング検証
  console.log('[Test 3] Workspace Mapping validation starting...');
  const execWsp = workspaceRegistry.getWorkspace('wsp-executive');
  assert.strictEqual(execWsp.layoutId, 'lyt-exec-desktop');
  assert.ok(execWsp.widgetIds.includes('wdg-kpi'));
  assert.ok(execWsp.widgetIds.includes('wdg-history'));
  assert.ok(execWsp.widgetIds.includes('wdg-evidence'));
  assert.ok(execWsp.widgetIds.includes('wdg-audit'));
  assert.strictEqual(execWsp.viewMode, 'executive');
  console.log('[Test 3] Workspace Mapping validation: PASSED');

  // Test 4: Adapter による ViewModel 変換・優先度ソート検証
  console.log('[Test 4] Adapter mapping starting...');
  const vm = workspaceAdapter.getDashboardWorkspaceData();
  assert.ok(vm.workspaces.length > 0);
  assert.ok(Object.isFrozen(vm));
  assert.ok(Object.isFrozen(vm.workspaces));
  
  // 優先度 (priority) の昇順ソート検証
  for (let i = 0; i < vm.workspaces.length - 1; i++) {
    assert.ok(vm.workspaces[i].spec.priority <= vm.workspaces[i+1].spec.priority);
  }
  console.log('[Test 4] Adapter mapping: PASSED');

  // Test 5: Observer Boundary (操作UIおよびAI関連キーワードの不在検証)
  console.log('[Test 5] Observer boundary checks starting...');
  const html = workspaceCard.render({ workspaces: vm.workspaces });

  // AI 予測・推薦・最適化・自動配置・自動生成・自動切替などの文言チェック
  const forbiddenKeywords = ['予測', '推薦', '最適化', '自動配置', '自動生成', '自動切替'];
  forbiddenKeywords.forEach(kw => {
    assert.ok(!html.includes(kw), `Forbidden keyword found: ${kw}`);
  });

  // 操作ボタンや入力コントロールの不在チェック
  const interactiveTags = ['<button', '<input', '<select', '<form', '<textarea'];
  interactiveTags.forEach(tag => {
    assert.ok(!html.includes(tag), `Interactive element tag found: ${tag}`);
  });
  console.log('[Test 5] Observer boundary checks: PASSED');

  console.log('All Dashboard Workspace Foundation tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
