"use strict";

/**
 * test_multi_tenant_executive.js
 * 
 * Multi-Tenant Executive Aggregation View Foundation 用の Node.js 単体テスト。
 */

const assert = require('assert');

// 擬似 window オブジェクトのモック化
global.window = {};

// 1. 依存スクリプトのロード
require('../src/dashboard/DashboardTenantRegistryStore.js');
require('../src/dashboard/DashboardTenantHierarchyStore.js');
require('../src/dashboard/DashboardEventTimelineStore.js');
require('../src/dashboard/MultiTenantExecutiveAdapter.js');

// 2. 外部依存のモック化 (スコア参照以外の密結合を防止するためスタブ定義)
global.window.TrustGovernanceAdapter = {
  getGovernanceData: () => {
    return {
      complianceScore: 95,
      status: "PASS",
      records: [ { id: 1, text: "Mock record details to test isolation" } ]
    };
  }
};

const timelineStore = global.window.DashboardEventTimelineStore;

// テストデータ準備
timelineStore.add({
  eventId: "evt-global-001",
  tenantId: "MIE-03",
  message: "Event MIE-03"
});
timelineStore.add({
  eventId: "evt-global-002",
  tenantId: "TENANT-002",
  message: "Event TENANT-002"
});

// --- テスト定義 ---

try {
  // Test 1: MultiTenantExecutiveAdapter - 横断集約ロジックと不変性の検証
  console.log('[Test 1] Multi-Tenant Executive Adapter validation starting...');
  const adapter = global.window.MultiTenantExecutiveAdapter;
  const globalData = adapter.getMultiTenantExecutiveData();

  // 集計値の検証
  assert.strictEqual(globalData.totalTenants, 2); // MIE-03 & TENANT-002
  assert.strictEqual(globalData.totalRegions, 3);  // 2 (MIE-03) + 1 (TENANT-002 default)
  assert.strictEqual(globalData.totalAreas, 4);    // 3 (MIE-03) + 1 (TENANT-002 default)
  assert.strictEqual(globalData.totalEvents, 2);   // Added 2 events in this test suite
  assert.strictEqual(globalData.trustScore, 95);   // TrustGovernanceAdapter score matching

  // 不変性検証
  assert.throws(() => {
    globalData.totalEvents = 500;
  }, TypeError);
  console.log('[Test 1] Multi-Tenant Executive Adapter validation: PASSED');

  // Test 2: スコア参照以外の密結合防止検証
  console.log('[Test 2] Loose coupling verification starting...');
  const trustData = global.window.TrustGovernanceAdapter.getGovernanceData();
  // アダプターが直接 complianceScore 以外の詳細プロパティ（records等）を参照してグローバルデータに漏洩させていないか確認
  assert.strictEqual(globalData.records, undefined);
  assert.strictEqual(globalData.status, undefined);
  console.log('[Test 2] Loose coupling verification: PASSED');

  console.log('All Multi-Tenant Executive Aggregation tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
