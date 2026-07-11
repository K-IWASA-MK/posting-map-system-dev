"use strict";

/**
 * test_multi_tenant.js
 * 
 * Multi-Tenant Separation View Foundation 用の Node.js 単体テスト。
 */

const assert = require('assert');

// 擬似 window オブジェクトのモック化
global.window = {};

// 1. 依存スクリプトのロード
require('../src/dashboard/DashboardTenantRegistryStore.js');
require('../src/dashboard/DashboardTenantHierarchyStore.js');
require('../src/dashboard/DashboardEventTimelineStore.js');
require('../src/dashboard/MultiTenantAdapter.js');

// 2. タイムラインストアのテストデータ追加用モック化
global.window.DashboardTenantContext = {
  getContext: () => ({ tenantId: "MIE-03" })
};
global.window.DashboardHierarchyContext = {
  getContext: () => ({ tenantId: "MIE-03", regionId: "REGION-001", areaId: "AREA-001" })
};

// テストデータ準備
const timelineStore = global.window.DashboardEventTimelineStore;

// テナント「MIE-03」用のイベントを追加
timelineStore.add({
  eventId: "evt-mie-001",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-001",
  message: "Mie event 1"
});

// テナント「TENANT-002」用のイベントを追加
timelineStore.add({
  eventId: "evt-t2-001",
  tenantId: "TENANT-002",
  regionId: "DEFAULT",
  areaId: "DEFAULT",
  message: "Tenant-002 event 1"
});

// --- テスト定義 ---

try {
  // Test 1: DashboardTenantRegistryStore - 不変性とテナント登録内容の検証
  console.log('[Test 1] Tenant Registry Store validation starting...');
  const registryStore = global.window.DashboardTenantRegistryStore;
  const tenants = registryStore.getTenants();

  assert.strictEqual(tenants.length, 2);
  assert.strictEqual(tenants[0].tenantId, "MIE-03");
  assert.strictEqual(tenants[1].tenantId, "TENANT-002");

  // 不変性検証
  assert.throws(() => {
    tenants[0].tenantName = "MUTATED-NAME";
  }, TypeError);
  console.log('[Test 1] Tenant Registry Store validation: PASSED');

  // Test 2: MultiTenantAdapter - テナントごとの隔離・集計ロジック検証
  console.log('[Test 2] Multi-Tenant Adapter aggregation validation starting...');
  const adapter = global.window.MultiTenantAdapter;
  const viewData = adapter.getMultiTenantData();

  assert.ok(viewData.tenants);
  assert.strictEqual(viewData.tenants.length, 2);

  // MIE-03 の集計確認
  const mieData = viewData.tenants.find(t => t.tenantId === "MIE-03");
  assert.ok(mieData);
  assert.strictEqual(mieData.tenantType, "political");
  assert.strictEqual(mieData.regionCount, 2); // Sample Region 1 & 2
  assert.strictEqual(mieData.areaCount, 3);   // Area A, B & C
  assert.strictEqual(mieData.eventCount, 1);  // evt-mie-001 のみ

  // TENANT-002 の集計確認
  const t2Data = viewData.tenants.find(t => t.tenantId === "TENANT-002");
  assert.ok(t2Data);
  assert.strictEqual(t2Data.tenantType, "enterprise");
  // 階層ストアに TENANT-002 のデータがないため、デフォルト階層が使われる
  assert.strictEqual(t2Data.regionCount, 1); // Default Region
  assert.strictEqual(t2Data.areaCount, 1);   // Default Area
  assert.strictEqual(t2Data.eventCount, 1);  // evt-t2-001 のみ

  // 不変性検証
  assert.throws(() => {
    viewData.tenants[0].eventCount = 999;
  }, TypeError);
  console.log('[Test 2] Multi-Tenant Adapter aggregation validation: PASSED');

  console.log('All Multi-Tenant Separation View Foundation tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
