// CIE Platform Dashboard JavaScript

const JSON_ARTIFACTS = [
    "asset_graph.json",
    "execution_graph.json",
    "call_graph_index.json",
    "repository_index.json",
    "knowledge_graph.json",
    "semantic_layer.json",
    "route_graph.json",
    "data_flow.json",
    "static_analysis.json",
    "refactor_candidates.json",
    "transformation_plan.json",
    "execution_plan.json",
    "patch_plan.json",
    "patch_apply_plan.json",
    "patch_rollback_plan.json"
];

let refreshTimer = null;

async function initDashboard() {
    // API 経由での設定取得
    let config = {
        cie_version: "2.2.0-alpha.0",
        platform_phase: "Phase24",
        theme: "dark",
        dashboard: { refresh_interval: 30 },
        api: { host: "127.0.0.1", port: 8080 }
    };
    
    try {
        const cfgResponse = await fetch("http://127.0.0.1:8080/config");
        if (cfgResponse.ok) {
            const cfgJson = await cfgResponse.json();
            if (cfgJson && cfgJson.config) {
                config = cfgJson.config;
            }
        }
    } catch (e) {
        console.warn("Failed to fetch API config, using defaults.");
    }
    
    // UIデバッグ要素の更新
    document.getElementById("cfg-api-server").textContent = `${config.api?.host ?? "127.0.0.1"}:${config.api?.port ?? 8080}`;
    document.getElementById("cfg-theme").textContent = config.theme ?? "dark";
    document.getElementById("cfg-refresh").textContent = `${config.dashboard?.refresh_interval ?? 30}s`;
    document.getElementById("meta-cie-version").textContent = config.cie_version ?? "2.2.0-alpha.0";
    document.getElementById("meta-platform-phase").textContent = config.platform_phase ?? "Phase24";

    // 自動更新タイマーのセット（初回のみ）
    if (!refreshTimer) {
        const interval = (config.dashboard?.refresh_interval ?? 30) * 1000;
        refreshTimer = setInterval(initDashboard, interval);
    }

    const dataStore = {};
    let missingCount = 0;
    let corruptedCount = 0;
    
    // 非同期で15個のJSONをまとめてロード
    const fetchPromises = JSON_ARTIFACTS.map(async (filename) => {
        try {
            // Relative path to JSON files from tools/dashboard/
            const response = await fetch(`../${filename}`);
            if (!response.ok) {
                missingCount++;
                return;
            }
            const data = await response.json();
            dataStore[filename] = data;
        } catch (e) {
            corruptedCount++;
        }
    });
    
    await Promise.all(fetchPromises);
    
    // Overall Health & Status & Summary
    let overallHealth = "GOOD";
    let statusLabel = "OK";
    let overallDisplay = "★★★★★";
    let statusClass = "good";
    let pipelineIntegrity = "PASS";
    
    if (corruptedCount > 0) {
        overallHealth = "ERROR";
        statusLabel = "ERROR";
        overallDisplay = "☆☆☆☆☆";
        statusClass = "error";
        pipelineIntegrity = "FAIL";
    } else if (missingCount > 0) {
        overallHealth = "WARNING";
        statusLabel = "WARNING";
        overallDisplay = "★★★☆☆";
        statusClass = "warning";
        pipelineIntegrity = "FAIL";
    }
    
    // 各成果物からの件数集計
    const candidatesCnt = dataStore["refactor_candidates.json"]?.candidates?.length ?? -1;
    const plansCnt = dataStore["transformation_plan.json"]?.plans?.length ?? -1;
    const execCnt = dataStore["execution_plan.json"]?.execution?.length ?? -1;
    const patchCnt = dataStore["patch_plan.json"]?.patches?.length ?? -1;
    const applyCnt = dataStore["patch_apply_plan.json"]?.apply_tasks?.length ?? -1;
    const rollbackCnt = dataStore["patch_rollback_plan.json"]?.rollback_tasks?.length ?? -1;
    
    // Pipeline Integrity チェック
    if (overallHealth === "GOOD") {
        if (candidatesCnt === plansCnt && plansCnt === exec_cnt() && exec_cnt() === patch_cnt() && patch_cnt() === apply_cnt() && apply_cnt() === rollback_cnt()) {
            pipelineIntegrity = "PASS";
        } else {
            pipelineIntegrity = "FAIL";
            overallHealth = "WARNING";
            statusLabel = "WARNING";
            overallDisplay = "★★★☆☆";
            statusClass = "warning";
        }
    }
    
    // ヘルパー関数: exec_cnt() 等のエラー回避用
    function getSafeCount(cnt) {
        return cnt !== -1 ? cnt : "-";
    }
    function exec_cnt() { return execCnt; }
    function patch_cnt() { return patchCnt; }
    function apply_cnt() { return applyCnt; }
    function rollback_cnt() { return rollbackCnt; }

    // UIのHealthパネル表示更新
    const lightEl = document.getElementById("status-light");
    lightEl.className = `status-light ${statusClass}`;
    
    document.getElementById("health-status").textContent = statusLabel;
    document.getElementById("rating-stars").textContent = overallDisplay;
    
    const integrityEl = document.getElementById("pipeline-integrity");
    integrityEl.textContent = pipelineIntegrity;
    integrityEl.className = `badge-status ${pipelineIntegrity.toLowerCase()}`;
    
    // Generated At メタデータ
    let generatedAt = "N/A";
    if (dataStore["knowledge_graph.json"]?._meta?.generated_at) {
        generatedAt = dataStore["knowledge_graph.json"]._meta.generated_at;
    }
    document.getElementById("generated-at").textContent = generatedAt;
    
    // 1. Repository Summary
    const functionsCnt = dataStore["execution_graph.json"]?.functions ? Object.keys(dataStore["execution_graph.json"].functions).length : "-";
    const routesCnt = dataStore["route_graph.json"]?.routes ? Object.keys(dataStore["route_graph.json"].routes).length : "-";
    
    let assetsCnt = "-";
    if (dataStore["asset_graph.json"]) {
        assetsCnt = Object.keys(dataStore["asset_graph.json"]).filter(k => k !== "_meta").length;
    }
    
    let htmlFilesCnt = "-";
    let jsFilesCnt = "-";
    if (dataStore["repository_index.json"]?.files) {
        const files = dataStore["repository_index.json"].files;
        htmlFilesCnt = Object.values(files).filter(f => f.type === "html").length;
        jsFilesCnt = Object.values(files).filter(f => f.type === "js").length;
    }
    
    document.getElementById("sum-js-files").textContent = jsFilesCnt;
    document.getElementById("sum-html-files").textContent = htmlFilesCnt;
    document.getElementById("sum-functions").textContent = functionsCnt;
    document.getElementById("sum-routes").textContent = routesCnt;
    document.getElementById("sum-assets").textContent = assetsCnt;
    
    // 2. Semantic Layer カテゴリ分布
    const semanticChart = document.getElementById("semantic-chart");
    semanticChart.innerHTML = ""; // クリア
    
    if (dataStore["semantic_layer.json"]?.functions) {
        const semFuncs = dataStore["semantic_layer.json"].functions;
        const semanticCats = {
            "Initialization": 0, "Navigation": 0, "Rendering": 0, "Storage": 0,
            "Authentication": 0, "Synchronization": 0, "Configuration": 0,
            "Utility": 0, "Unknown": 0
        };
        
        let totalSem = 0;
        Object.values(semFuncs).forEach(f_info => {
            const cat = f_info.category || "Unknown";
            if (cat in semanticCats) {
                semanticCats[cat]++;
                totalSem++;
            } else {
                semanticCats["Unknown"]++;
                totalSem++;
            }
        });
        
        // 棒グラフを描画
        Object.entries(semanticCats).forEach(([catName, count]) => {
            const pct = totalSem > 0 ? (count / totalSem) * 100 : 0;
            
            const barContainer = document.createElement("div");
            barContainer.className = "chart-bar-container";
            barContainer.innerHTML = `
                <div class="chart-bar-header">
                    <span class="chart-bar-name">${catName}</span>
                    <span class="chart-bar-val">${count}</span>
                </div>
                <div class="chart-bar-bg">
                    <div class="chart-bar-fill" style="width: ${pct}%"></div>
                </div>
            `;
            semanticChart.appendChild(barContainer);
        });
    } else {
        semanticChart.innerHTML = `<div class="loading-spinner">No Semantic Data Available</div>`;
    }
    
    // 3. Static Analysis
    const unusedCnt = dataStore["static_analysis.json"]?.analysis?.unused_functions?.length ?? "-";
    const highImpactCnt = dataStore["static_analysis.json"]?.analysis?.high_impact_functions?.length ?? "-";
    const hubCnt = dataStore["static_analysis.json"]?.analysis?.hub_functions?.length ?? "-";
    const orphanCnt = dataStore["static_analysis.json"]?.analysis?.orphan_routes?.length ?? "-";
    
    document.getElementById("ana-unused").textContent = unusedCnt;
    document.getElementById("ana-high-impact").textContent = highImpactCnt;
    document.getElementById("ana-hubs").textContent = hubCnt;
    document.getElementById("ana-orphans").textContent = orphanCnt;
    
    // 4. Execution Pipeline Steps
    document.getElementById("pipe-candidates").textContent = getSafeCount(candidatesCnt);
    document.getElementById("pipe-plans").textContent = getSafeCount(plansCnt);
    document.getElementById("pipe-execs").textContent = getSafeCount(execCnt);
    document.getElementById("pipe-patches").textContent = getSafeCount(patchCnt);
    document.getElementById("pipe-apply").textContent = getSafeCount(applyCnt);
    // 5. Plugins & Runtime Summary
    let plugLoaded = 0;
    let plugReady = 0;
    let execAllowed = "Disabled";
    
    try {
        const plugResponse = await fetch("http://127.0.0.1:8080/plugins");
        if (plugResponse.ok) {
            const plugJson = await plugResponse.json();
            const pluginsList = plugJson.plugins || [];
            plugLoaded = pluginsList.filter(p => p.status === "loaded").length;
        }
    } catch (e) {
        console.warn("Failed to fetch plugins from API.");
    }

    try {
        const runResponse = await fetch("http://127.0.0.1:8080/runtime");
        if (runResponse.ok) {
            const runJson = await runResponse.json();
            const runtimeList = runJson.runtime || [];
            plugReady = runtimeList.filter(r => r.status === "ready").length;
            const anyAllowed = runtimeList.some(r => r.execution_allowed);
            execAllowed = anyAllowed ? "Allowed" : "Disabled";
        }
    } catch (e) {
        console.warn("Failed to fetch runtime from API.");
    }
    
    document.getElementById("plug-loaded").textContent = plugLoaded;
    document.getElementById("plug-ready").textContent = plugReady;
    document.getElementById("plug-execution").textContent = execAllowed;
}

// ページロード時にイニシャライズ
window.addEventListener("DOMContentLoaded", initDashboard);
