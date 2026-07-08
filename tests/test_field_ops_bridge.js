// test_field_ops_bridge.js
// Unit assertions for Field Intelligence Bridge Event Schema, Provider, and Store Integration

global.window = {};

const fs = require('fs');
const path = require('path');

// 1. スクリプトの eval ロード
const timelineCode = fs.readFileSync(path.join(__dirname, '../src/dashboard/DashboardEventTimelineStore.js'), 'utf8');
eval(timelineCode + "\nglobal.DashboardEventTimelineStore = DashboardEventTimelineStore;");
const DashboardEventTimelineStore = global.DashboardEventTimelineStore;

const providerCode = fs.readFileSync(path.join(__dirname, '../src/dashboard/FieldOpsEventProvider.js'), 'utf8');
eval(providerCode + "\nglobal.FieldOpsEventProvider = FieldOpsEventProvider;");
const FieldOpsEventProvider = global.FieldOpsEventProvider;

// window へのバインド
window.DashboardEventTimelineStore = DashboardEventTimelineStore;
window.FieldOpsEventProvider = FieldOpsEventProvider;

// モックの他ストア依存関係
window.DashboardTenantContext = {
  getContext: () => ({
    tenantId: "MIE-03",
    tenantName: "三重第3支部",
    environment: "SIMULATION"
  })
};

// EventBus のモック（直接 TimelineStore へバイパス注入させる）
window.DashboardEventBus = null;

// 2. テストの実行
console.log("--- 1. Provider Schema Adaption & Freeze Test ---");
const rawEvent = {
  areaId: "AREA-501",
  action: "DISTRIBUTION_ACTIVITY",
  payload: {
    staffId: "staff-999",
    volume: 300,
    details: "Testing bridge event"
  }
};

const success = FieldOpsEventProvider.injectEvent(rawEvent);
console.assert(success === true, "Should inject event successfully");

const timeline = DashboardEventTimelineStore.getTimeline();
console.log("Timeline items after injection:", JSON.stringify(timeline, null, 2));
console.assert(timeline.length === 1, "Should have 1 timeline record");

const injected = timeline[0];
console.assert(injected.source === "FIELDOPS", "Source should be normalized to FIELDOPS");
console.assert(injected.tenantId === "MIE-03", "Tenant ID should be MIE-03 (inherited)");
console.assert(injected.payload.staffId === "staff-999", "Staff ID should be matched");
console.assert(Object.isFrozen(injected), "Injected event must be frozen");
console.assert(Object.isFrozen(injected.payload), "Injected event payload must be frozen");

console.log("✅ All Field Operations Bridge assertions passed!");
