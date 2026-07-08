"use strict";

/**
 * test_field_audit.js
 * 
 * Field Intelligence Audit Foundation 用の Node.js 単体テスト。
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
require('../src/dashboard/DashboardFieldAuditStore.js');
require('../src/dashboard/FieldAuditAdapter.js');
require('../src/dashboard/components/FieldAuditCard.js');

// 3. テナントコンテキストおよび階層コンテキストのスタブ定義
let currentTenantId = "MIE-03";
global.window.DashboardTenantContext = {
  getContext: () => ({ tenantId: currentTenantId, tenantName: "三重第3支部" })
};

const timelineStore = global.window.DashboardEventTimelineStore;
const historyStore = global.window.DashboardFieldHistoryStore;
const evidenceStore = global.window.DashboardFieldEvidenceStore;
const auditStore = global.window.DashboardFieldAuditStore;
const auditAdapter = global.window.FieldAuditAdapter;

// テストデータ準備（FieldOpsイベント）
timelineStore.add({
  eventId: "evt-fops-aud-001",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-001",
  source: "FIELDOPS",
  timestamp: "08:30:00",
  message: "Activity registered in AREA-001"
});

timelineStore.add({
  eventId: "evt-fops-aud-002",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-001",
  source: "FIELDOPS",
  timestamp: "09:15:00",
  message: "More activity in AREA-001"
});

timelineStore.add({
  eventId: "evt-fops-aud-003",
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
auditStore.processAudit();

try {
  // Test 1: Object.freeze() 不変性検証
  console.log('[Test 1] Audit store Object.freeze validation starting...');
  const auditData = auditStore.getAuditData();
  assert.ok(auditData.length > 0);
  assert.ok(Object.isFrozen(auditData));
  assert.ok(Object.isFrozen(auditData[0]));
  assert.throws(() => {
    auditData[0].eventCount = 999;
  }, TypeError);
  console.log('[Test 1] Audit store Object.freeze validation: PASSED');

  // Test 2: Evidence -> Audit生成 & Tenant/Region/Area 継承検証
  console.log('[Test 2] Evidence to Audit generation validation starting...');
  const records = auditStore.getAuditData();
  assert.strictEqual(records.length, 2);

  const mie03Area01 = records.find(r => r.tenantId === "MIE-03" && r.areaId === "AREA-001");
  assert.ok(mie03Area01);
  assert.strictEqual(mie03Area01.auditId, "aud-evd-MIE-03-REGION-001-AREA-001");
  assert.strictEqual(mie03Area01.evidenceId, "evd-MIE-03-REGION-001-AREA-001");
  assert.strictEqual(mie03Area01.eventCount, 2);
  assert.strictEqual(mie03Area01.regionId, "REGION-001");
  assert.strictEqual(mie03Area01.auditTime, "09:15:00"); // EvidenceのgeneratedTimeを継承
  console.log('[Test 2] Evidence to Audit generation validation: PASSED');

  // Test 3: Adapter フィルタリング検証
  console.log('[Test 3] Adapter filtering validation starting...');
  const activeData = auditAdapter.getFieldAuditData();
  assert.strictEqual(activeData.tenantId, "MIE-03");
  assert.strictEqual(activeData.auditList.length, 1); // MIE-03 のみ
  assert.ok(activeData.auditList.every(r => r.tenantId === "MIE-03"));
  console.log('[Test 3] Adapter filtering validation: PASSED');

  // Test 4: Observer Boundary (AI要素・操作要素の不在)
  console.log('[Test 4] Observer boundary check starting...');
  const html = global.window.FieldAuditCard.render({ auditList: activeData.auditList });

  // AI予測・最適化・推奨・指示などのキーワードチェック
  const forbiddenKeywords = ['予測', '推奨', '最適', '指示', '配置提案', '改善案', 'リスク評価', 'リスク判定'];
  forbiddenKeywords.forEach(kw => {
    assert.ok(!html.includes(kw), `Forbidden keyword found: ${kw}`);
  });

  // 操作ボタンやフォームなどのチェック
  const interactiveTags = ['<button', '<input', '<select', '<form', '<textarea'];
  interactiveTags.forEach(tag => {
    assert.ok(!html.includes(tag), `Interactive element tag found: ${tag}`);
  });
  console.log('[Test 4] Observer boundary check: PASSED');

  console.log('All Field Intelligence Audit tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
