"use strict";

/**
 * test_dashboard_layout.js
 * 
 * Dashboard Layout Engine Foundation 用の Node.js 単体テスト。
 */

const assert = require('assert');

// 1. 擬似 window オブジェクトのモック化
global.window = {};

// 2. 依存スクリプトのロード
require('../src/dashboard/DashboardWidgetRegistry.js');
require('../src/dashboard/DashboardLayoutRegistry.js');
require('../src/dashboard/DashboardLayoutEngine.js');
require('../src/dashboard/DashboardLayoutAdapter.js');
require('../src/dashboard/components/DashboardLayoutCard.js');

const layoutRegistry = global.window.DashboardLayoutRegistry;
const layoutEngine = global.window.DashboardLayoutEngine;
const layoutAdapter = global.window.DashboardLayoutAdapter;
const layoutCard = global.window.DashboardLayoutCard;

try {
  // Test 1: Layout Registry Object.freeze 不変性検証
  console.log('[Test 1] Layout Registry Object.freeze validation starting...');
  const layouts = layoutRegistry.getAllLayouts();
  assert.ok(layouts.length > 0);
  assert.ok(Object.isFrozen(layouts));
  assert.ok(Object.isFrozen(layouts[0]));
  assert.ok(Object.isFrozen(layouts[0].widgets));
  assert.ok(Object.isFrozen(layouts[0].widgets[0]));

  assert.throws(() => {
    layouts[0].layoutName = "MUTATED";
  }, TypeError);

  assert.throws(() => {
    layouts[0].widgets.push({ widgetId: "new" });
  }, TypeError);
  
  assert.throws(() => {
    layouts[0].widgets[0].x = 99;
  }, TypeError);
  console.log('[Test 1] Layout Registry Object.freeze validation: PASSED');

  // Test 2: Layout Engine グリッド＆配置座標・バリデーション検証
  console.log('[Test 2] Layout Engine validation starting...');
  const activeLayout = layoutEngine.resolveActiveLayout(1200); // デスクトップ幅
  assert.strictEqual(activeLayout.layoutId, 'lyt-exec-desktop');
  assert.strictEqual(activeLayout.columns, 12);
  assert.strictEqual(activeLayout.rows, 8);
  assert.strictEqual(activeLayout.breakpoint, 'desktop');

  // 登録ウィジェットWDGのフィルタバリデーション検証
  // 事前登録: wdg-kpi, wdg-history, wdg-evidence, wdg-audit (すべて登録済)
  assert.strictEqual(activeLayout.widgets.length, 4);
  
  // 座標値の正確性確認
  const kpiWidget = activeLayout.widgets.find(w => w.widgetId === 'wdg-kpi');
  assert.ok(kpiWidget);
  assert.strictEqual(kpiWidget.x, 0);
  assert.strictEqual(kpiWidget.y, 0);
  assert.strictEqual(kpiWidget.w, 4);
  assert.strictEqual(kpiWidget.h, 2);
  console.log('[Test 2] Layout Engine validation: PASSED');

  // Test 3: ビューポート幅に応じたレスポンシブ判定 (Desktop -> Tablet -> Mobile)
  console.log('[Test 3] Responsive breakpoint transitions starting...');
  // Desktop (>= 1024px)
  const desktop = layoutEngine.resolveActiveLayout(1024);
  assert.strictEqual(desktop.breakpoint, 'desktop');
  assert.strictEqual(desktop.layoutId, 'lyt-exec-desktop');

  // Tablet (768px - 1023px)
  const tablet = layoutEngine.resolveActiveLayout(1023);
  assert.strictEqual(tablet.breakpoint, 'tablet');
  assert.strictEqual(tablet.layoutId, 'lyt-exec-tablet');
  assert.strictEqual(tablet.columns, 8);

  // Mobile (< 768px)
  const mobile = layoutEngine.resolveActiveLayout(767);
  assert.strictEqual(mobile.breakpoint, 'mobile');
  assert.strictEqual(mobile.layoutId, 'lyt-exec-mobile');
  assert.strictEqual(mobile.columns, 4);
  console.log('[Test 3] Responsive breakpoint transitions: PASSED');

  // Test 4: Adapter による ViewModel 変換検証
  console.log('[Test 4] Adapter mapping starting...');
  const vm = layoutAdapter.getDashboardLayoutData(1200);
  assert.ok(vm.activeLayout);
  assert.ok(Object.isFrozen(vm));
  assert.ok(Object.isFrozen(vm.activeLayout));
  assert.strictEqual(vm.activeLayout.layoutId, 'lyt-exec-desktop');
  console.log('[Test 4] Adapter mapping: PASSED');

  // Test 5: Observer Boundary (操作要素およびAI関連キーワードの不在検証)
  console.log('[Test 5] Observer boundary checks starting...');
  const html = layoutCard.render({ activeLayout: vm.activeLayout });

  // AI 予測・推薦・最適化・自動配置・配置提案などの文言チェック
  const forbiddenKeywords = ['予測', '推薦', '最適化', '自動配置', '配置提案'];
  forbiddenKeywords.forEach(kw => {
    assert.ok(!html.includes(kw), `Forbidden keyword found: ${kw}`);
  });

  // 操作ボタンや入力コントロールの不在チェック
  const interactiveTags = ['<button', '<input', '<select', '<form', '<textarea'];
  interactiveTags.forEach(tag => {
    assert.ok(!html.includes(tag), `Interactive element tag found: ${tag}`);
  });
  console.log('[Test 5] Observer boundary checks: PASSED');

  console.log('All Dashboard Layout Engine tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
