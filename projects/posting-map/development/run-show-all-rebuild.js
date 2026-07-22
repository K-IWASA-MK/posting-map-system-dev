/**
 * POSTING MAP - Unhide All Area Sheets & Rebuild System Cache
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Unhiding area sheets and rebuilding System Cache...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&showAll=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const json = await res.json();

  console.log(`\n========================================`);
  console.log(`🎉 【統合検証 パイプライン結果監査レポート】`);
  console.log(`========================================`);
  console.log(`ステータス          : ${json.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`表示可視化シート数  : ${json.shownCount || 0} シート`);
  console.log(`✅ 完走エリアシート数: ${json.summaryCount || 0} エリア`);
  console.log(`📈 全体カバー予定枚数: ${json.stats?.total || 0} 枚\n`);

  if (json.summary && json.summary.length > 0) {
    const summary = json.summary;
    console.log(`--- 🔹 [生成エリアシート一覧 (先頭 10 エリア)] ---`);
    summary.slice(0, 10).forEach((item, idx) => {
      console.log(`  [${idx + 1}] エリア名: "${item.name}" | 合計枚数: ${item.total}件 | 代表住所: ${item.repAddress}`);
    });

    if (summary.length > 10) {
      console.log(`\n--- 🔹 [生成エリアシート一覧 (末尾 10 エリア)] ---`);
      summary.slice(-10).forEach((item, idx) => {
        console.log(`  [${summary.length - 10 + idx + 1}] エリア名: "${item.name}" | 合計枚数: ${item.total}件 | 代表住所: ${item.repAddress}`);
      });
    }
  }

  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Show All Rebuild Error:", err.message);
  process.exit(1);
});
