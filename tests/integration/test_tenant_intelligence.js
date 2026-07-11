"use strict";

/**
 * test_tenant_intelligence.js
 * 
 * Tenant Intelligence Drilldown Foundation 用の Node.js 単体テスト。
 */

const assert = require('assert');

// 擬似 window オブジェクトのモック化
global.window = {};

// 1. 依存スクリプトのロード
require('../src/dashboard/DashboardTenantRegistryStore.js');
require('../src/dashboard/DashboardTenantIntelligenceStore.js');
require('../src/dashboard/DashboardEventTimelineStore.js');
require('../src/dashboard/TenantIntelligenceAdapter.js');

// 2. テナントコンテキストおよび階層コンテキストのスタブ定義
let currentTenantId = "MIE-03";
global.window.DashboardTenantContext = {
  getContext: () => ({ tenantId: currentTenantId })
};
global.window.DashboardHierarchyContext = {
  getContext: () => ({ tenantId: currentTenantId, regionId: "REGION-001", areaId: "AREA-001" })
};

const timelineStore = global.window.DashboardEventTimelineStore;

// テストデータ準備
timelineStore.add({
  eventId: "evt-intel-001",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-001",
  sourceType: "FIELDOPS",
  timestamp: "12:00:00"
});

// --- テスト定義 ---

try {
  // Test 1: Store Object.freeze 不変性検証
  console.log('[Test 1] Store Object.freeze validation starting...');
  const mapping = global.window.DashboardTenantIntelligenceStore.getHierarchyMapping();
  assert.ok(mapping["MIE-03"]);
  assert.throws(() => {
    mapping["MIE-03"] = {};
  }, TypeError);
  console.log('[Test 1] Store Object.freeze validation: PASSED');

  // Test 2: Tenant -> Region -> Area mapping 検証
  console.log('[Test 2] Tenant -> Region -> Area mapping aggregation starting...');
  const adapter = global.window.TenantIntelligenceAdapter;
  const intelData = adapter.getTenantIntelligenceData();

  // MIE-03 の集計検証
  assert.strictEqual(intelData.tenantSummary.tenantId, "MIE-03");
  assert.strictEqual(intelData.tenantSummary.regionCount, 2);
  assert.strictEqual(intelData.tenantSummary.areaCount, 3);
  assert.strictEqual(intelData.tenantSummary.eventCount, 1);

  // Region 1 の検証
  const reg1 = intelData.regionSummary.find(r => r.regionId === "REGION-001");
  assert.ok(reg1);
  assert.strictEqual(reg1.areaCount, 2);
  assert.strictEqual(reg1.eventCount, 1); // Added event belongs here

  // Area 1 の検証
  const area1 = intelData.areaSummary.find(a => a.areaId === "AREA-001");
  assert.ok(area1);
  assert.strictEqual(area1.eventCount, 1);
  assert.strictEqual(area1.lastActivity, "12:00:00");

  // FieldOps 集計の検証
  assert.strictEqual(intelData.fieldEventSummary.totalFieldEvents, 1);
  assert.strictEqual(intelData.fieldEventSummary.standbyStatus, "CONNECTED");
  console.log('[Test 2] Tenant -> Region -> Area mapping aggregation: PASSED');

  // Test 3: DEFAULT fallback 検証
  console.log('[Test 3] DEFAULT fallback validation starting...');
  currentTenantId = "UNKNOWN-TENANT"; // 登録されていないテナント
  const fallbackData = adapter.getTenantIntelligenceData();

  assert.strictEqual(fallbackData.tenantSummary.tenantId, "UNKNOWN-TENANT");
  // 登録されていない場合、DEFAULT regions/areas にフォールバックする
  assert.strictEqual(fallbackData.tenantSummary.regionCount, 1);
  assert.strictEqual(fallbackData.tenantSummary.areaCount, 1);
  assert.strictEqual(fallbackData.regionSummary[0].regionId, "DEFAULT");
  assert.strictEqual(fallbackData.areaSummary[0].areaId, "DEFAULT");
  console.log('[Test 3] DEFAULT fallback validation: PASSED');

  // Test 4: Event hierarchy inheritance 検盛
  console.log('[Test 4] Event hierarchy inheritance validation starting...');
  currentTenantId = "MIE-03";
  timelineStore.add({
    eventId: "evt-intel-002",
    tenantId: "MIE-03",
    regionId: "REGION-002",
    areaId: "AREA-003",
    sourceType: "FIELDOPS",
    timestamp: "12:15:00"
  });

  const updatedData = adapter.getTenantIntelligenceData();
  assert.strictEqual(updatedData.tenantSummary.eventCount, 2);

  const reg2 = updatedData.regionSummary.find(r => r.regionId === "REGION-002");
  assert.strictEqual(reg2.eventCount, 1);

  const area3 = updatedData.areaSummary.find(a => a.areaId === "AREA-003");
  assert.strictEqual(area3.eventCount, 1);
  assert.strictEqual(area3.lastActivity, "12:15:00");
  console.log('[Test 4] Event hierarchy inheritance validation: PASSED');

  console.log('All Tenant Intelligence Drilldown tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
