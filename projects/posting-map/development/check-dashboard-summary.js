/**
 * POSTING MAP - Direct Dashboard & System Cache Audit Runner
 * (観測・監査専用)
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Fetching getDashboardData & System Cache status...`);
  const url = `${WEB_APP_URL}?action=getDashboardData&apiKey=valid-api-key`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const json = await res.json();

  console.log(`\n========================================`);
  console.log(`📊 【統合検証 パイプライン結果監査レポート】`);
  console.log(`========================================`);
  
  if (json && json.summary) {
    const summary = json.summary;
    console.log(`✅ 完走エリアシート数 : ${summary.length} エリア`);
    console.log(`📈 全体カバー予定枚数 : ${json.stats?.total || 0} 枚\n`);

    console.log(`--- 🔹 [生成エリアシート一覧 (先頭 10 エリア)] ---`);
    summary.slice(0, 10).forEach((item, idx) => {
      console.log(`  [${idx + 1}] エリア名: "${item.name}" | 合計件数: ${item.total}件 | 代表住所: ${item.repAddress}`);
    });

    if (summary.length > 10) {
      console.log(`\n--- 🔹 [生成エリアシート一覧 (末尾 10 エリア)] ---`);
      summary.slice(-10).forEach((item, idx) => {
        console.log(`  [${summary.length - 10 + idx + 1}] エリア名: "${item.name}" | 合計件数: ${item.total}件 | 代表住所: ${item.repAddress}`);
      });
    }
  } else {
    console.log(`⚠️ Summary not ready yet or JSON error:`, json);
  }

  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Audit Error:", err.message);
  process.exit(1);
});
