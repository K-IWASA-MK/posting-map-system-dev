// test_tenant_context.js
// Tenant Context Singleton & Store Integration Unit Test

global.window = {};

const fs = require('fs');
const path = require('path');

// 1. テナント・コンテキストのロード
const contextCode = fs.readFileSync(path.join(__dirname, '../src/dashboard/DashboardTenantContext.js'), 'utf8');
eval(contextCode + "\nglobal.DashboardTenantContext = DashboardTenantContext;");
const DashboardTenantContext = global.DashboardTenantContext;

// window.DashboardTenantContext のモック
window.DashboardTenantContext = DashboardTenantContext;

// 2. ストアのロード
const timelineCode = fs.readFileSync(path.join(__dirname, '../src/dashboard/DashboardEventTimelineStore.js'), 'utf8');
eval(timelineCode + "\nglobal.DashboardEventTimelineStore = DashboardEventTimelineStore;");
const DashboardEventTimelineStore = global.DashboardEventTimelineStore;

// window.DashboardEventTimelineStore のモック
window.DashboardEventTimelineStore = DashboardEventTimelineStore;

// 3. テスト実行
console.log("--- 1. Tenant Context Singleton Test ---");
const context = DashboardTenantContext.getContext();
console.log(JSON.stringify(context, null, 2));

console.assert(context.tenantId === "MIE-03", "Tenant ID should be MIE-03");
console.assert(context.tenantName === "三重第3支部", "Tenant Name should be 三重第3支部");
console.assert(Object.isFrozen(context), "Context should be frozen");

console.log("--- 2. Store Integration Test ---");
// 新しいイベントの追加 (tenantId を省略)
const event1 = {
  eventId: "evt-001",
  timestamp: "12:00:00",
  rawTimestamp: Date.now(),
  message: "Test event 1"
};

DashboardEventTimelineStore.add(event1);
const timeline = DashboardEventTimelineStore.getTimeline();
const addedEvent = timeline[0];

console.log("Staged event after store add:", JSON.stringify(addedEvent, null, 2));
console.assert(addedEvent.tenantId === "MIE-03", "Default tenantId MIE-03 should be automatically assigned");
console.assert(Object.isFrozen(addedEvent), "Staged event should be frozen");

// 互換性テスト: tenantId を明示的に指定した場合
const event2 = {
  eventId: "evt-002",
  tenantId: "OSA-01",
  timestamp: "12:00:05",
  rawTimestamp: Date.now() + 1000,
  message: "Test event 2 with explicit tenant"
};

DashboardEventTimelineStore.add(event2);
const updatedTimeline = DashboardEventTimelineStore.getTimeline();
const explicitEvent = updatedTimeline.find(item => item.eventId === "evt-002");
console.assert(explicitEvent.tenantId === "OSA-01", "Explicit tenantId should be preserved");

console.log("✅ All tenant context and store assertions passed!");
