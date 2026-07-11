"use strict";

/**
 * test_field_evidence.js
 * 
 * Field Intelligence Evidence Foundation 用の Node.js 単体テスト。
 */

const assert = require('assert');

// 1. 擬似 window オブジェクトのモック化
global.window = {};

// 2. 依存スクリプトのロード
require('../src/dashboard/DashboardEventBus.js');

require('../src/dashboard/DashboardTenantRegistryStore.js');
require('../src/dashboard/DashboardTenantHierarchyStore.js');
require('../src/dashboard/DashboardTenantIntelligenceStore.js');
require('../src/dashboard/DashboardEventTimelineStore.js');
require('../src/dashboard/DashboardFieldHistoryStore.js');
require('../src/dashboard/DashboardFieldEvidenceStore.js');
require('../src/dashboard/FieldEvidenceAdapter.js');
require('../src/dashboard/components/FieldEvidenceCard.js');

// 3. テナントコンテキストおよび階層コンテキストのスタブ定義
let currentTenantId = "MIE-03";
global.window.DashboardTenantContext = {
  getContext: () => ({ tenantId: currentTenantId, tenantName: "三重第3支部" })
};

const timelineStore = global.window.DashboardEventTimelineStore;
const historyStore = global.window.DashboardFieldHistoryStore;
const evidenceStore = global.window.DashboardFieldEvidenceStore;
const evidenceAdapter = global.window.FieldEvidenceAdapter;

// テストデータ準備（FieldOpsイベント）
timelineStore.add({
  eventId: "evt-fops-001",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-001",
  source: "FIELDOPS",
  timestamp: "08:30:00",
  message: "Activity registered in AREA-001"
});

timelineStore.add({
  eventId: "evt-fops-002",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-001",
  source: "FIELDOPS",
  timestamp: "09:15:00",
  message: "More activity in AREA-001"
});

timelineStore.add({
  eventId: "evt-fops-003",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-002",
  source: "FIELDOPS",
  timestamp: "10:00:00",
  message: "Activity registered in AREA-002"
});

timelineStore.add({
  eventId: "evt-fops-004",
  tenantId: "TOKYO-01", // 異なるテナント
  regionId: "REGION-002",
  areaId: "AREA-003",
  source: "FIELDOPS",
  timestamp: "11:00:00",
  message: "Tokyo activity in AREA-003"
});

// ストア同期
historyStore.getHistoryData();
evidenceStore.processEvidence();

try {
  // Test 1: Object.freeze() 不変性検証
  console.log('[Test 1] Evidence store Object.freeze validation starting...');
  const evidenceData = evidenceStore.getEvidenceData();
  assert.ok(evidenceData.length > 0);
  assert.ok(Object.isFrozen(evidenceData));
  assert.ok(Object.isFrozen(evidenceData[0]));
  assert.throws(() => {
    evidenceData[0].eventCount = 999;
  }, TypeError);
  console.log('[Test 1] Evidence store Object.freeze validation: PASSED');

  // Test 2: Evidence生成 & Tenant/Region/Area 継承検証
  console.log('[Test 2] Evidence generation & inheritance validation starting...');
  const records = evidenceStore.getEvidenceData();
  assert.strictEqual(records.length, 3);

  const mie03Area01 = records.find(r => r.tenantId === "MIE-03" && r.areaId === "AREA-001");
  assert.ok(mie03Area01);
  assert.strictEqual(mie03Area01.evidenceId, "evd-MIE-03-REGION-001-AREA-001");
  assert.strictEqual(mie03Area01.eventCount, 2);
  assert.strictEqual(mie03Area01.regionId, "REGION-001");
  assert.strictEqual(mie03Area01.generatedTime, "09:15:00"); // 決定論的最新時刻

  const mie03Area02 = records.find(r => r.tenantId === "MIE-03" && r.areaId === "AREA-002");
  assert.ok(mie03Area02);
  assert.strictEqual(mie03Area02.eventCount, 1);
  assert.strictEqual(mie03Area02.generatedTime, "10:00:00");

  const tokyo01Area03 = records.find(r => r.tenantId === "TOKYO-01");
  assert.ok(tokyo01Area03);
  assert.strictEqual(tokyo01Area03.areaId, "AREA-003");
  assert.strictEqual(tokyo01Area03.eventCount, 1);
  console.log('[Test 2] Evidence generation & inheritance validation: PASSED');

  // Test 3: Adapter フィルタリング検証
  console.log('[Test 3] Adapter filtering validation starting...');
  const activeData = evidenceAdapter.getFieldEvidenceData();
  assert.strictEqual(activeData.tenantId, "MIE-03");
  assert.strictEqual(activeData.evidenceList.length, 2); // MIE-03 のみ
  assert.ok(activeData.evidenceList.every(r => r.tenantId === "MIE-03"));
  console.log('[Test 3] Adapter filtering validation: PASSED');

  // Test 4: Observer Boundary (AI要素・操作要素の不在)
  console.log('[Test 4] Observer boundary check starting...');
  const html = global.window.FieldEvidenceCard.render({ evidenceList: activeData.evidenceList });

  // AI予測・最適化・推奨・指示などのキーワードチェック
  const forbiddenKeywords = ['予測', '推奨', '最適', '指示', '配置提案', '改善案'];
  forbiddenKeywords.forEach(kw => {
    assert.ok(!html.includes(kw), `Forbidden keyword found: ${kw}`);
  });

  // 操作ボタンやフォームなどのチェック
  const interactiveTags = ['<button', '<input', '<select', '<form', '<textarea'];
  interactiveTags.forEach(tag => {
    assert.ok(!html.includes(tag), `Interactive element tag found: ${tag}`);
  });
  console.log('[Test 4] Observer boundary check: PASSED');

  console.log('All Field Intelligence Evidence tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
