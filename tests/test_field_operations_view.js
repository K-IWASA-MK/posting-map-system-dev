"use strict";

/**
 * test_field_operations_view.js
 * 
 * Field Intelligence Operations View Foundation 用の Node.js 単体テスト。
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
require('../src/dashboard/FieldOperationsAdapter.js');

// 2. テナントコンテキストおよび階層コンテキストのスタブ定義
let currentTenantId = "MIE-03";
global.window.DashboardTenantContext = {
  getContext: () => ({ tenantId: currentTenantId })
};
global.window.DashboardHierarchyContext = {
  getContext: () => ({ tenantId: currentTenantId, regionId: "REGION-001", areaId: "AREA-001" })
};

const timelineStore = global.window.DashboardEventTimelineStore;
const fieldStore = global.window.DashboardFieldOperationsStore;

// テストデータ準備（FieldOpsイベント）
timelineStore.add({
  eventId: "evt-fops-001",
  tenantId: "MIE-03",
  regionId: "REGION-001",
  areaId: "AREA-001",
  source: "FIELDOPS",
  timestamp: "13:00:00"
});

// イベントストア初期化と同期確認
fieldStore.getEvents();

// --- テスト定義 ---

try {
  // Test 1: Store Object.freeze 不変性検証
  console.log('[Test 1] Field operations store Object.freeze validation starting...');
  const events = fieldStore.getEvents();
  assert.ok(events.length > 0);
  assert.throws(() => {
    events[0].message = "MUTATED-MESSAGE";
  }, TypeError);
  console.log('[Test 1] Field operations store Object.freeze validation: PASSED');

  // Test 2: Tenant -> Region -> Area -> FieldEvent 継承・親子関係検証
  console.log('[Test 2] Tenant -> Region -> Area -> FieldEvent mapping validation starting...');
  const adapter = global.window.FieldOperationsAdapter;
  const opsData = adapter.getFieldOperationsData();

  assert.strictEqual(opsData.tenantContext.tenantId, "MIE-03");
  assert.strictEqual(opsData.tenantContext.totalActiveAreas, 3); // AREA-001, AREA-002, AREA-003
  assert.strictEqual(opsData.tenantContext.totalFieldEvents, 1);

  // Area 1 の検証
  const opArea1 = opsData.areaOperations.find(a => a.areaId === "AREA-001");
  assert.ok(opArea1);
  assert.strictEqual(opArea1.fieldEventsCount, 1);
  assert.strictEqual(opArea1.lastActivity, "13:00:00");
  console.log('[Test 2] Tenant -> Region -> Area -> FieldEvent mapping validation: PASSED');

  // Test 3: Coverage 分類分類判定ルール検証
  console.log('[Test 3] Coverage rate status classification validation starting...');
  // AREA-001 にイベントを 55 件追加 (カバー率 56% ➔ NORMAL)
  for (let i = 2; i <= 56; i++) {
    timelineStore.add({
      eventId: `evt-fops-normal-${i}`,
      tenantId: "MIE-03",
      regionId: "REGION-001",
      areaId: "AREA-001",
      source: "FIELDOPS",
      timestamp: "13:10:00"
    });
  }
  
  // キャッシュ同期
  fieldStore.updateFieldEvents(timelineStore.getTimeline());

  let updatedOps = adapter.getFieldOperationsData();
  let updatedArea1 = updatedOps.areaOperations.find(a => a.areaId === "AREA-001");
  assert.strictEqual(updatedArea1.coverageRate, 56);
  assert.strictEqual(updatedArea1.status, "NORMAL");

  // さらにイベントを追加して 85 件にする (カバー率 85% ➔ COMPLETE)
  for (let i = 57; i <= 85; i++) {
    timelineStore.add({
      eventId: `evt-fops-complete-${i}`,
      tenantId: "MIE-03",
      regionId: "REGION-001",
      areaId: "AREA-001",
      source: "FIELDOPS",
      timestamp: "13:20:00"
    });
  }

  // キャッシュ同期
  fieldStore.updateFieldEvents(timelineStore.getTimeline());

  updatedOps = adapter.getFieldOperationsData();
  updatedArea1 = updatedOps.areaOperations.find(a => a.areaId === "AREA-001");
  assert.strictEqual(updatedArea1.coverageRate, 85);
  assert.strictEqual(updatedArea1.status, "COMPLETE");
  console.log('[Test 3] Coverage rate status classification validation: PASSED');

  // Test 4: Observer Boundary (決定論的・入力要素0) 検証
  console.log('[Test 4] Observer boundary checking starting...');
  // UI コンポーネントのレンダリング結果に操作可能要素が含まれていないか静的にチェック
  require('../src/dashboard/components/FieldOperationsCard.js');
  require('../src/dashboard/components/AreaOperationsStatusCard.js');

  const cardHtml = global.window.FieldOperationsCard.render({ tenantContext: opsData.tenantContext });
  const statusHtml = global.window.AreaOperationsStatusCard.render({ areaOperations: opsData.areaOperations });

  assert.ok(!cardHtml.includes('<button'));
  assert.ok(!cardHtml.includes('<input'));
  assert.ok(!cardHtml.includes('<select'));
  assert.ok(!cardHtml.includes('<form'));

  assert.ok(!statusHtml.includes('<button'));
  assert.ok(!statusHtml.includes('<input'));
  assert.ok(!statusHtml.includes('<select'));
  assert.ok(!statusHtml.includes('<form'));
  console.log('[Test 4] Observer boundary checking: PASSED');

  console.log('All Field Operations View tests passed successfully!');
  process.exit(0);

} catch (err) {
  console.error('Test execution failed:', err);
  process.exit(1);
}
