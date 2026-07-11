"use strict";

/**
 * test_field_history.js
 * 
 * Field Intelligence History Foundation 用の Node.js 単体テスト。
 */

const assert = require('assert');

// 擬似 window オブジェクトのモック化
global.window = {};

// 1. 依存スクリプトのロード
require('../src/dashboard/DashboardTenantRegistryStore.js');
require('../src/dashboard/DashboardTenantHierarchyStore.js');
require('../src/dashboard/DashboardTenantIntelligenceStore.js');
require('../src/dashboard/DashboardEventTimelineStore.js');
require('../src/dashboard/DashboardFieldHistoryStore.js');
require('../src/dashboard/FieldHistoryAdapter.js');

// 2. テナントコンテキストおよび階層コンテキストのスタブ定義
let currentTenantId = "MIE-03";
global.window.DashboardTenantContext = {
  getContext: () => ({ tenantId: currentTenantId })
};
global.window.DashboardHierarchyContext = {
  getContext: () => ({ tenantId: currentTenantId, regionId: "REGION-001", areaId: "AREA-001" })
};

const timelineStore = global.window.DashboardEventTimelineStore;
const historyStore = global.window.DashboardFieldHistoryStore;

// テストデータ準備（FieldOpsイベント）
timelineStore.add({
  eventId: "evt-fops-hist-001",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-001",
  source: "FIELDOPS",
  timestamp: "08:30:00",
  message: "Activity registered in AREA-001"
});

timelineStore.add({
  eventId: "evt-fops-hist-002",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-002",
  source: "FIELDOPS",
  timestamp: "10:00:00",
  message: "Activity registered in AREA-002"
});

// ストア同期確認
historyStore.getHistoryData();

// --- テスト定義 ---

try {
  // Test 1: Store Object.freeze 不変性検証
  console.log('[Test 1] History store Object.freeze validation starting...');
  const historyData = historyStore.getHistoryData();
  assert.ok(historyData.history.length > 0);
  assert.throws(() => {
    historyData.history[0].message = "MUTATED-MSG";
  }, TypeError);
  console.log('[Test 1] History store Object.freeze validation: PASSED');

  // Test 2: スナップショット集計およびタイムラインの検証
  console.log('[Test 2] Time-series history snapshots aggregation validation starting...');
  assert.strictEqual(historyData.history.length, 2);

  // Snapshot 1 (09:00:00断面) ➔ 1件 (evt-fops-hist-001)
  const snap1 = historyData.snapshots.find(s => s.snapshotId === "snap-1");
  assert.ok(snap1);
  assert.strictEqual(snap1.totalEvents, 1);
  assert.strictEqual(snap1.coverage, 10);

  // Snapshot 2 (12:00:00断面) ➔ 2件 (両方)
  const snap2 = historyData.snapshots.find(s => s.snapshotId === "snap-2");
  assert.ok(snap2);
  assert.strictEqual(snap2.totalEvents, 2);
  assert.strictEqual(snap2.coverage, 20);
  console.log('[Test 2] Time-series history snapshots aggregation validation: PASSED');

  // Test 3: Observer Boundary (AI要素・予測要素の不在)
  console.log('[Test 3] Observer boundary check (no AI or interactive elements) starting...');
  require('../src/dashboard/components/FieldHistoryTimelineCard.js');
  require('../src/dashboard/components/HistorySnapshotCard.js');

  const timelineHtml = global.window.FieldHistoryTimelineCard.render({ historyTimeline: historyData.history });
  const snapshotHtml = global.window.HistorySnapshotCard.render({ historySnapshots: historyData.snapshots });

  // AI 予測や配布計画、自動通知のキーワードチェック
  const forbiddenKeywords = ['予測', '推奨', '最適', '指示', '配置提案', '改善案'];
  forbiddenKeywords.forEach(kw => {
    assert.ok(!timelineHtml.includes(kw), `Forbidden keyword found: ${kw}`);
    assert.ok(!snapshotHtml.includes(kw), `Forbidden keyword found: ${kw}`);
  });

  // 操作ボタンやフォームなどのチェック
  const interactiveTags = ['<button', '<input', '<select', '<form'];
  interactiveTags.forEach(tag => {
    assert.ok(!timelineHtml.includes(tag), `Interactive element tag found: ${tag}`);
    assert.ok(!snapshotHtml.includes(tag), `Interactive element tag found: ${tag}`);
  });
  console.log('[Test 3] Observer boundary check: PASSED');

  console.log('All Field Intelligence History tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
