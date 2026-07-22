/**
 * POSTING MAP - Sprint B-1.3 Postal Order Audit Runner
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Inspecting Postal Code Order from Spreadsheet & Extraction...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&auditPostalOrder=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const rawJson = await res.json();
  const json = rawJson.data || rawJson;

  console.log(`\n========================================`);
  console.log(`🔬 【Sprint B-1.3: 郵便番号昇順 監査レポート】`);
  console.log(`========================================\n`);

  console.log(`--- 1. 抽出データ全体における郵便番号昇順判定 ---`);
  console.log(`  - 郵便番号昇順状態: ${json.isExtractedAscending ? '✅ 完全昇順 (Ascending)' : '❌ 非昇順箇所あり (Not Ascending)'}`);

  if (!json.isExtractedAscending && json.nonAscendingPairs && json.nonAscendingPairs.length > 0) {
    console.log(`\n--- 🔹 [昇順が崩れている箇所 (非昇順ペア サンプル 5件)] ---`);
    json.nonAscendingPairs.slice(0, 5).forEach(pair => {
      console.log(`  [位置 #${pair.index}] 前: ${pair.prev.postalCode} (${pair.prev.address}) ➔ 次: ${pair.curr.postalCode} (${pair.curr.address})`);
    });
  }

  console.log(`\n--- 2. スプレッドシート「三重郡」シート上の実データ (上から順) ---`);
  console.log(`  - 「三重郡」シート格納件数: ${json.miegunSheetRowsCount || 0} 行`);
  if (json.miegunSheetRows && json.miegunSheetRows.length > 0) {
    json.miegunSheetRows.slice(0, 10).forEach(r => {
      console.log(`  [行 #${r.row}] 住所: "${r.address}" | 地図: ${r.mapFormula}`);
    });
  }

  console.log(`\n--- 3. 抽出データ内の「三重郡」属する全行郵便番号リスト (先頭 15件) ---`);
  console.log(`  - 「三重郡」抽出総件数: ${json.miegunExtractedCount || 0} 件`);
  if (json.miegunExtractedPostalList) {
    json.miegunExtractedPostalList.slice(0, 15).forEach(item => {
      console.log(`  [#${item.index.toString().padStart(2, ' ')}] 郵便番号: ${item.postalCode} | 住所: "${item.address}"`);
    });
  }

  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Postal Audit Error:", err.message);
  process.exit(1);
});
