"use strict";

/**
 * test_field_analytics.js
 * 
 * Field Intelligence Analytics Foundation 用の Node.js 単体テスト。
 */

const assert = require('assert');

// 擬似 window オブジェクトのモック化
global.window = {};

// 1. 依存スクリプトのロード
require('../src/dashboard/DashboardTenantRegistryStore.js');
require('../src/dashboard/DashboardTenantHierarchyStore.js');
require('../src/dashboard/DashboardTenantIntelligenceStore.js');
require('../src/dashboard/DashboardEventTimelineStore.js');
require('../src/dashboard/DashboardFieldOperationsStore.js');
require('../src/dashboard/DashboardFieldAnalyticsStore.js');
require('../src/dashboard/FieldOperationsAdapter.js');
require('../src/dashboard/FieldAnalyticsAdapter.js');

// 2. テナントコンテキストおよび階層コンテキストのスタブ定義
let currentTenantId = "MIE-03";
global.window.DashboardTenantContext = {
  getContext: () => ({ tenantId: currentTenantId })
};
global.window.DashboardHierarchyContext = {
  getContext: () => ({ tenantId: currentTenantId, regionId: "REGION-001", areaId: "AREA-001" })
};

const timelineStore = global.window.DashboardEventTimelineStore;
const analyticsStore = global.window.DashboardFieldAnalyticsStore;

const todayMs = Date.now();
const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;

// テストデータ準備（FieldOpsイベント）
timelineStore.add({
  eventId: "evt-fops-yest-001",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-001",
  source: "FIELDOPS",
  timestamp: "12:00:00",
  rawTimestamp: yesterdayMs
});

timelineStore.add({
  eventId: "evt-fops-today-001",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-001",
  source: "FIELDOPS",
  timestamp: "12:00:00",
  rawTimestamp: todayMs
});

timelineStore.add({
  eventId: "evt-fops-today-002",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-001",
  source: "FIELDOPS",
  timestamp: "13:00:00",
  rawTimestamp: todayMs
});

// 分析ストア同期確認
analyticsStore.getAnalyticsData();

// --- テスト定義 ---

try {
  // Test 1: Store Object.freeze 不変性検証
  console.log('[Test 1] Analytics store Object.freeze validation starting...');
  const analyticsData = analyticsStore.getAnalyticsData();
  assert.ok(analyticsData.history.length > 0);
  assert.throws(() => {
    analyticsData.history[0].timestamp = "MUTATED-TIME";
  }, TypeError);
  console.log('[Test 1] Analytics store Object.freeze validation: PASSED');

  // Test 2: 時系列日別・月間集約の正確性の検証
  console.log('[Test 2] Time series daily & monthly aggregation validation starting...');
  const todayKey = new Date(todayMs).toISOString().split('T')[0];
  const yesterdayKey = new Date(yesterdayMs).toISOString().split('T')[0];
  const monthKey = todayKey.substring(0, 7);

  assert.strictEqual(analyticsData.dailyTrend[todayKey], 2);
  assert.strictEqual(analyticsData.dailyTrend[yesterdayKey], 1);
  assert.strictEqual(analyticsData.monthlyTrend[monthKey], 3);
  console.log('[Test 2] Time series daily & monthly aggregation validation: PASSED');

  // Test 3: 前日比 (Day-over-Day Comparison) 変化率の計算検証
  console.log('[Test 3] Day-over-Day comparison metric validation starting...');
  const adapter = global.window.FieldAnalyticsAdapter;
  const viewData = adapter.getFieldAnalyticsData();

  assert.strictEqual(viewData.trendData.todayEvents, 2);
  assert.strictEqual(viewData.trendData.yesterdayEvents, 1);
  assert.strictEqual(viewData.trendData.dodChange, 100); // (2 - 1) / 1 * 100 = 100%
  console.log('[Test 3] Day-over-Day comparison metric validation: PASSED');

  // Test 4: Observer Boundary (予測・推奨要素の不在チェック)
  console.log('[Test 4] Observer boundary check for AI or Interactive elements starting...');
  require('../src/dashboard/components/FieldAnalyticsTrendCard.js');
  require('../src/dashboard/components/FieldAnalyticsComparisonCard.js');

  const trendHtml = global.window.FieldAnalyticsTrendCard.render({ trendData: viewData.trendData, averageCoverage: viewData.averageCoverage });
  const compHtml = global.window.FieldAnalyticsComparisonCard.render({ areaComparison: viewData.areaComparison, coverageHistory: viewData.coverageHistory });

  // UI 内に AI 予測や配布指示、推奨等の表現が一切含まれていないことを保証
  const forbiddenKeywords = ['推奨', '改善してください', '次に配布すべき場所', '最適ルート', '配置提案', '遅延予測', '完了予測'];
  forbiddenKeywords.forEach(kw => {
    assert.ok(!trendHtml.includes(kw), `Forbidden keyword found: ${kw}`);
    assert.ok(!compHtml.includes(kw), `Forbidden keyword found: ${kw}`);
  });

  // 操作用要素 (button, input 等) の不在検証
  const interactiveTags = ['<button', '<input', '<select', '<form'];
  interactiveTags.forEach(tag => {
    assert.ok(!trendHtml.includes(tag), `Interactive tag found: ${tag}`);
    assert.ok(!compHtml.includes(tag), `Interactive tag found: ${tag}`);
  });
  console.log('[Test 4] Observer boundary check: PASSED');

  console.log('All Field Intelligence Analytics tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
