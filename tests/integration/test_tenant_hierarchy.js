"use strict";

/**
 * test_tenant_hierarchy.js
 * 
 * Tenant Hierarchy Context Foundation のための Node.js 単体テスト。
 */

const assert = require('assert');

// 擬似 window オブジェクトのモック化
global.window = {};

// 1. スクリプトのロード
require('../src/dashboard/DashboardTenantHierarchyStore.js');
require('../src/dashboard/DashboardHierarchyContext.js');
require('../src/dashboard/FieldOpsEventProvider.js');
require('../src/dashboard/DashboardEventTimelineStore.js');

// 2. モック EventBus & TenantContext の準備
global.window.DashboardTenantContext = {
  getContext: () => ({ tenantId: "MIE-03" })
};

let lastPublishedEvent = null;
global.window.DashboardEventBus = {
  publishRealtimeEvent: (evt) => {
    lastPublishedEvent = evt;
  }
};

// --- テスト定義 ---

try {
  // Test 1: DashboardTenantHierarchyStore - 不変性と階層構造の検証
  console.log('[Test 1] Hierarchy Store validation starting...');
  const store = global.window.DashboardTenantHierarchyStore;
  const mieHierarchy = store.getHierarchy("MIE-03");

  assert.strictEqual(mieHierarchy.tenantId, "MIE-03");
  assert.strictEqual(mieHierarchy.tenantType, "political");
  assert.ok(Array.isArray(mieHierarchy.hierarchy.regions));
  assert.strictEqual(mieHierarchy.hierarchy.regions[0].regionId, "REGION-001");
  assert.strictEqual(mieHierarchy.hierarchy.regions[0].areas[0].areaId, "AREA-001");

  // 不変性検証
  assert.throws(() => {
    mieHierarchy.tenantId = "MUTATED";
  }, TypeError);
  assert.throws(() => {
    mieHierarchy.hierarchy.regions[0].regionName = "MUTATED-NAME";
  }, TypeError);
  console.log('[Test 1] Hierarchy Store validation: PASSED');

  // Test 2: DashboardHierarchyContext - 観測コンテキストの不変性検証
  console.log('[Test 2] Hierarchy Context validation starting...');
  const ctx = global.window.DashboardHierarchyContext;
  const currentCtx = ctx.getContext();

  assert.strictEqual(currentCtx.tenantId, "MIE-03");
  assert.strictEqual(currentCtx.regionId, "REGION-001");
  assert.strictEqual(currentCtx.areaId, "AREA-001");

  assert.throws(() => {
    currentCtx.regionId = "MUTATED-REGION";
  }, TypeError);
  console.log('[Test 2] Hierarchy Context validation: PASSED');

  // Test 3: FieldOpsEventProvider - regionId / areaId 付与と fallback の検証
  console.log('[Test 3] Event normalization & fallback validation starting...');
  const provider = global.window.FieldOpsEventProvider;

  // 3.1 通常フロー (Context から自動引き継ぎ)
  provider.injectEvent({
    eventId: "evt-001",
    action: "DISTRIBUTION_ACTIVITY",
    payload: { staffId: "staff-1", volume: 10 }
  });

  assert.ok(lastPublishedEvent);
  assert.strictEqual(lastPublishedEvent.tenantId, "MIE-03");
  assert.strictEqual(lastPublishedEvent.regionId, "REGION-001");
  assert.strictEqual(lastPublishedEvent.areaId, "AREA-001");

  // 3.2 明示的指定フロー
  provider.injectEvent({
    eventId: "evt-002",
    regionId: "CUSTOM-REG",
    areaId: "CUSTOM-AREA"
  });
  assert.strictEqual(lastPublishedEvent.regionId, "CUSTOM-REG");
  assert.strictEqual(lastPublishedEvent.areaId, "CUSTOM-AREA");

  // 3.3 Fallback フロー (Context も存在しない状態をスタブ化)
  global.window.DashboardHierarchyContext = null;
  provider.injectEvent({
    eventId: "evt-003"
  });
  assert.strictEqual(lastPublishedEvent.regionId, "DEFAULT");
  assert.strictEqual(lastPublishedEvent.areaId, "DEFAULT");

  console.log('[Test 3] Event normalization & fallback validation: PASSED');

  // Test 4: DashboardEventTimelineStore - 蓄積と Object.freeze の検証
  console.log('[Test 4] Timeline Store mapping validation starting...');
  const timelineStore = global.window.DashboardEventTimelineStore;
  
  timelineStore.add({
    eventId: "evt-timeline-001",
    regionId: "REG-TIMELINE",
    areaId: "AREA-TIMELINE",
    message: "Timeline event test"
  });

  const timeline = timelineStore.getTimeline();
  const addedEvent = timeline.find(e => e.eventId === "evt-timeline-001");
  assert.ok(addedEvent);
  assert.strictEqual(addedEvent.regionId, "REG-TIMELINE");
  assert.strictEqual(addedEvent.areaId, "AREA-TIMELINE");

  // 不変性検証
  assert.throws(() => {
    addedEvent.regionId = "MUTATED";
  }, TypeError);
  console.log('[Test 4] Timeline Store mapping validation: PASSED');

  console.log('All Tenant Hierarchy Context Foundation tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
