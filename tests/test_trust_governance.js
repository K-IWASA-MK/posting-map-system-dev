// test_trust_governance.js
// Unit assertions for Trust Governance Data, Store, Adapter, and Status rules

global.window = {};

const fs = require('fs');
const path = require('path');

// 1. モック DOM 環境の構築
global.document = {
  querySelectorAll: (selector) => {
    return { length: 0 };
  },
  getElementById: (id) => {
    return {
      querySelectorAll: (selector) => {
        return { length: 0 };
      }
    };
  }
};

// 2. スクリプトの eval ロード
const storeCode = fs.readFileSync(path.join(__dirname, '../src/dashboard/DashboardTrustStore.js'), 'utf8');
eval(storeCode + "\nglobal.DashboardTrustStore = DashboardTrustStore;");
const DashboardTrustStore = global.DashboardTrustStore;

const builderCode = fs.readFileSync(path.join(__dirname, '../src/dashboard/DashboardTrustBuilder.js'), 'utf8');
eval(builderCode + "\nglobal.DashboardTrustBuilder = DashboardTrustBuilder;");
const DashboardTrustBuilder = global.DashboardTrustBuilder;

const adapterCode = fs.readFileSync(path.join(__dirname, '../src/dashboard/TrustGovernanceAdapter.js'), 'utf8');
eval(adapterCode + "\nglobal.TrustGovernanceAdapter = TrustGovernanceAdapter;");
const TrustGovernanceAdapter = global.TrustGovernanceAdapter;

// window へのバインド
window.DashboardTrustStore = DashboardTrustStore;
window.DashboardTrustBuilder = DashboardTrustBuilder;
window.TrustGovernanceAdapter = TrustGovernanceAdapter;

// モックの他ストア依存関係
window.DashboardTenantContext = {
  getContext: () => ({
    tenantId: "MIE-03",
    tenantName: "三重第3支部",
    environment: "SIMULATION"
  })
};

window.DashboardEventTimelineStore = {
  getTimeline: () => []
};

// 3. テストの実行
console.log("--- 1. Store Immutability Test ---");
DashboardTrustStore.clear();
const r1 = {
  recordId: "rec-001",
  category: "observer_boundary",
  metricName: "Test Metric",
  status: "PASS",
  score: 100,
  details: "Initial compliant state"
};
DashboardTrustStore.addRecord(r1);

const records = DashboardTrustStore.getRecords();
console.log("Staged records:", JSON.stringify(records, null, 2));
console.assert(records.length === 1, "Should have 1 record");
console.assert(records[0].tenantId === "MIE-03", "Should inherit MIE-03 tenant ID");
console.assert(Object.isFrozen(records[0]), "Record must be frozen");

console.log("--- 2. Builder Compliance Logic Test ---");
DashboardTrustBuilder.buildAuditMetrics();
const finalRecords = DashboardTrustStore.getRecords();
console.assert(finalRecords.length === 3, "Should build 3 default audit records");
console.assert(finalRecords.every(r => r.status === "PASS"), "All metrics should be PASS initially");
console.assert(finalRecords.every(r => r.score === 100), "All scores should be 100 initially");

console.log("--- 3. Adapter Aggregation Test ---");
const viewData = TrustGovernanceAdapter.getGovernanceData();
console.log("Aggregated view data:", JSON.stringify(viewData, null, 2));
console.assert(viewData.complianceScore === 100, "Global compliance score should be 100");
console.assert(viewData.status === "PASS", "Global status should be PASS");
console.assert(Object.isFrozen(viewData), "View data object should be frozen");

// 状態変化シミュレーション (1項目が NOTICE になった場合)
window.DashboardTrustBuilder = null; // Builder を一時的にモック解除して手動設定データを維持
DashboardTrustStore.clear();
DashboardTrustStore.addRecord({
  recordId: "rec-obs",
  category: "observer_boundary",
  metricName: "Observer Boundary Integrity",
  status: "NOTICE",
  score: 80,
  details: "Simulated notice state"
});
DashboardTrustStore.addRecord({
  recordId: "rec-imm",
  category: "immutability",
  metricName: "Storage Immutability Integrity",
  status: "PASS",
  score: 100,
  details: "Simulated pass state"
});

const noticeViewData = TrustGovernanceAdapter.getGovernanceData();
console.log("Simulated NOTICE view data:", JSON.stringify(noticeViewData, null, 2));
console.assert(noticeViewData.complianceScore === 90, "Compliance score should be (80+100)/2 = 90");
console.assert(noticeViewData.status === "NOTICE", "Global status should escalate to NOTICE");

console.log("✅ All Trust Governance assertions passed!");
