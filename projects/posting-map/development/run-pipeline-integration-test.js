/**
 * POSTING MAP - Full Pipeline Integration Test Runner
 * (観測・監査専用 - コード変更なし)
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`🚀 Starting Full Pipeline Integration Test (317 records)...`);

  // Step A: Trigger forceStartBatch()
  const startUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&triggerBatch=true`;
  console.log(`📡 [Phase 1] Triggering forceStartBatch()...`);
  const startRes = await fetch(startUrl, { method: 'GET', redirect: 'follow' });
  const startJson = await startRes.json();
  console.log(`  └─ Start Response:`, startJson.message || startJson.data?.message);

  // Poll for completion (Wait max 3 minutes)
  let completed = false;
  let attempts = 0;
  while (!completed && attempts < 30) {
    attempts++;
    await new Promise(r => setTimeout(r, 6000)); // Wait 6s
    const statusUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&checkBatchStatus=true`;
    const statusRes = await fetch(statusUrl, { method: 'GET', redirect: 'follow' });
    const statusJson = await statusRes.json();
    console.log(`⏳ [Polling ${attempts}] Batch Status: ${statusJson.data?.batchStatus || statusJson.message}`);
    if (statusJson.data?.batchStatus === "completed" || statusJson.data?.isCompleted) {
      completed = true;
    }
  }

  // Step B: Audit Dashboard & System Cache
  console.log(`\n📡 [Phase 4] Fetching Dashboard Summary API...`);
  const dashUrl = `${WEB_APP_URL}?action=getDashboardData&apiKey=valid-api-key`;
  const dashRes = await fetch(dashUrl, { method: 'GET', redirect: 'follow' });
  const dashJson = await dashRes.json();

  console.log(`\n========================================`);
  console.log(`📊 【統合検証 パイプライン監査レポート】`);
  console.log(`========================================`);
  
  if (dashJson && dashJson.summary) {
    const summary = dashJson.summary;
    console.log(`✅ パイプライン完走数 : ${summary.length} エリアシート`);
    console.log(`📈 全体カバー予定枚数 : ${dashJson.stats?.total || 0} 枚\n`);

    console.log(`--- 🔹 [エリアシート生成サンプル (先頭5エリア)] ---`);
    summary.slice(0, 5).forEach((item, idx) => {
      console.log(`  [${idx + 1}] エリア名: "${item.name}" | 合計件数: ${item.total}件 | 代表住所: ${item.repAddress}`);
    });

    console.log(`\n--- 🔹 [エリアシート生成サンプル (末尾5エリア)] ---`);
    summary.slice(-5).forEach((item, idx) => {
      console.log(`  [${summary.length - 5 + idx + 1}] エリア名: "${item.name}" | 合計件数: ${item.total}件 | 代表住所: ${item.repAddress}`);
    });
  } else {
    console.error(`❌ Dashboard API audit failed:`, dashJson);
  }

  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Test Error:", err.message);
  process.exit(1);
});
