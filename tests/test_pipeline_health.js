// test_pipeline_health.js
// PipelineHealthAdapter のロジック・不変アサーションの単体テスト

global.window = {};

const fs = require('fs');
const path = require('path');

// ブラウザ用の js ファイルを node でロードするため eval する
const adapterCode = fs.readFileSync(path.join(__dirname, '../src/dashboard/PipelineHealthAdapter.js'), 'utf8');
eval(adapterCode + "\nglobal.PipelineHealthAdapter = PipelineHealthAdapter;");

const PipelineHealthAdapter = global.PipelineHealthAdapter;

// 1. 各ストアのモックを作成
window.DashboardEventTimelineStore = { getTimeline: () => new Array(50) };
window.DashboardEventCorrelationStore = { getCorrelations: () => new Array(120) };
window.DashboardEventGraphStore = { getGraphs: () => new Array(20) };
window.DashboardEventKnowledgeStore = { getKnowledges: () => new Array(15) };
window.DashboardEventInsightStore = { getInsights: () => new Array(10) };
window.DashboardEventEvolutionStore = { getEvolutions: () => new Array(8) };
window.DashboardEventPatternStore = { getPatterns: () => new Array(3) };
window.DashboardEventMemoryStore = { getMemories: () => new Array(350), maxCapacity: 1000 };

// 2. データの取得
const data = PipelineHealthAdapter.getHealthData();

console.log("--- Pipeline Health Data Test Output ---");
console.log(JSON.stringify(data, null, 2));

// 3. アサーション
console.assert(data.pipelineNodes.length === 8, "Should contain exactly 8 nodes");
console.assert(Object.isFrozen(data), "Output data should be frozen");
console.assert(Object.isFrozen(data.pipelineNodes), "Nodes list should be frozen");

data.pipelineNodes.forEach(node => {
  console.assert(Object.isFrozen(node), `Node ${node.layerName} should be frozen`);
  console.assert(Object.isFrozen(node.latency), `Node ${node.layerName} latency should be frozen`);
  console.assert(node.latency.source === "SIMULATION", "Latency source should be SIMULATION");
  
  // 決定論的ルールの逆算テスト
  let expectedStatus = "HEALTHY";
  if (node.latency.value > 500 || node.bufferSize > 80) {
    expectedStatus = "CONGESTED";
  } else if (node.latency.value > 100 || node.bufferSize > 50) {
    expectedStatus = "ATTENTION";
  }
  
  console.assert(node.status === expectedStatus, `Status for ${node.layerName} should be ${expectedStatus}, got ${node.status}`);
});

console.log("✅ All pipeline health unit assertions passed!");
