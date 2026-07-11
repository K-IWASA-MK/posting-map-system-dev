"use strict";

/**
 * test_dashboard_widget.js
 * 
 * Dashboard Widget Foundation 用の Node.js 単体テスト。
 */

const assert = require('assert');

// 1. 擬似 window オブジェクトのモック化
global.window = {};

// 2. 依存スクリプトのロード
require('../src/dashboard/DashboardWidgetRegistry.js');
require('../src/dashboard/DashboardWidgetFactory.js');
require('../src/dashboard/DashboardWidgetLifecycle.js');
require('../src/dashboard/DashboardWidgetAdapter.js');
require('../src/dashboard/components/DashboardWidgetCard.js');

const registry = global.window.DashboardWidgetRegistry;
const factory = global.window.DashboardWidgetFactory;
const lifecycle = global.window.DashboardWidgetLifecycle;
const adapter = global.window.DashboardWidgetAdapter;
const card = global.window.DashboardWidgetCard;

try {
  // Test 1: Registry Object.freeze 不変性検証
  console.log('[Test 1] Registry Object.freeze validation starting...');
  const widgets = registry.getAllWidgets();
  assert.ok(widgets.length > 0);
  assert.ok(Object.isFrozen(widgets));
  assert.ok(Object.isFrozen(widgets[0]));
  assert.ok(Object.isFrozen(widgets[0].viewModes));
  
  assert.throws(() => {
    widgets[0].widgetTitle = "MUTATED";
  }, TypeError);

  assert.throws(() => {
    widgets[0].viewModes.push("newMode");
  }, TypeError);
  console.log('[Test 1] Registry Object.freeze validation: PASSED');

  // Test 2: Factory 仕様バリデーション・生成検証
  console.log('[Test 2] Factory spec validation starting...');
  const spec = registry.getWidget('wdg-kpi');
  assert.ok(spec);
  
  const instance = factory.createWidget(spec);
  assert.strictEqual(instance.widgetId, 'wdg-kpi');
  assert.strictEqual(instance.componentName, 'ExecutiveKPICard');
  assert.strictEqual(instance.status, 'CREATED');
  assert.ok(Object.isFrozen(instance));
  assert.ok(Object.isFrozen(instance.metadata));

  // バリデーションチェック: componentName 欠如
  assert.throws(() => {
    factory.createWidget({ widgetId: 'test' });
  }, /componentName is required/);

  // バリデーションチェック: widgetId 欠如
  assert.throws(() => {
    factory.createWidget({ componentName: 'TestCard' });
  }, /widgetId is required/);
  console.log('[Test 2] Factory spec validation: PASSED');

  // Test 3: Lifecycle 状態遷移検証 (CREATED -> REGISTERED -> READY -> RENDERED)
  console.log('[Test 3] Lifecycle transitions starting...');
  let w = factory.createWidget(spec);
  assert.strictEqual(w.status, 'CREATED');

  w = lifecycle.transition(w, 'REGISTERED');
  assert.strictEqual(w.status, 'REGISTERED');

  w = lifecycle.transition(w, 'READY');
  assert.strictEqual(w.status, 'READY');

  w = lifecycle.transition(w, 'RENDERED');
  assert.strictEqual(w.status, 'RENDERED');

  // RENDERED が終端状態であることの検証 (READYへ戻る等の逆遷移・更なる遷移の禁止)
  assert.throws(() => {
    lifecycle.transition(w, 'READY');
  }, /Invalid status transition/);
  console.log('[Test 3] Lifecycle transitions: PASSED');

  // Test 4: Adapter レジストリ➔ViewModel変換・優先度ソート検証
  console.log('[Test 4] Adapter mapping starting...');
  const vm = adapter.getDashboardWidgetData();
  assert.ok(vm.widgets.length > 0);
  assert.ok(Object.isFrozen(vm));
  assert.ok(Object.isFrozen(vm.widgets));
  
  // 優先度 (widgetPriority) の昇順ソート検証
  for (let i = 0; i < vm.widgets.length - 1; i++) {
    assert.ok(vm.widgets[i].spec.widgetPriority <= vm.widgets[i+1].spec.widgetPriority);
  }
  console.log('[Test 4] Adapter mapping: PASSED');

  // Test 5: Observer Boundary (操作UIおよびAI要素の不在検証)
  console.log('[Test 5] Observer boundary checks starting...');
  const html = card.render({ widgets: vm.widgets });

  // AI 予測・推薦・最適化・自動配置などの文言チェック
  const forbiddenKeywords = ['予測', '推薦', '最適化', '自動配置'];
  forbiddenKeywords.forEach(kw => {
    assert.ok(!html.includes(kw), `Forbidden keyword found: ${kw}`);
  });

  // 操作ボタンや入力コントロールの不在チェック
  const interactiveTags = ['<button', '<input', '<select', '<form', '<textarea'];
  interactiveTags.forEach(tag => {
    assert.ok(!html.includes(tag), `Interactive element tag found: ${tag}`);
  });
  console.log('[Test 5] Observer boundary checks: PASSED');

  console.log('All Dashboard Widget Foundation tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
