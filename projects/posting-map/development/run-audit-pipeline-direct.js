/**
 * POSTING MAP - Direct Pipeline Audit Inspector
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Inspecting all generated Area Sheets and Pipeline Results directly from Spreadsheet...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&auditPipeline=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const json = await res.json();

  console.log(`\n========================================`);
  console.log(`🎉 【統合検証 パイプライン結果最終監査レポート】`);
  console.log(`========================================`);
  console.log(`ステータス          : ${json.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`✅ 完走エリアシート数: ${json.totalAreaSheets || 0} エリア`);
  console.log(`📈 全体カバー予定枚数: ${json.totalAddresses || 0} 枚\n`);

  if (json.areas && json.areas.length > 0) {
    const areas = json.areas;
    console.log(`--- 🔹 [生成エリアシート一覧 (先頭 10 エリア)] ---`);
    areas.slice(0, 10).forEach((item, idx) => {
      console.log(`  [${idx + 1}] エリア名: "${item.name}" | 枚数: ${item.total}件 | 先頭代表住所: ${item.repAddress}`);
    });

    if (areas.length > 10) {
      console.log(`\n--- 🔹 [生成エリアシート一覧 (末尾 10 エリア)] ---`);
      areas.slice(-10).forEach((item, idx) => {
        console.log(`  [${areas.length - 10 + idx + 1}] エリア名: "${item.name}" | 枚数: ${item.total}件 | 先頭代表住所: ${item.repAddress}`);
      });
    }
  }

  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Pipeline Direct Audit Error:", err.message);
  process.exit(1);
});
