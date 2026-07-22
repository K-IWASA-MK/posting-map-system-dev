/**
 * POSTING MAP - Sprint B-1.2 Generation Order Fact Inspector
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Inspecting Generation Order Facts from Spreadsheet...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&inspectSequence=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const rawJson = await res.json();
  const json = rawJson.data || rawJson;

  console.log(`\n========================================`);
  console.log(`🔬 【Sprint B-1.2: エリアシート生成順序 事実検証レポート】`);
  console.log(`========================================\n`);

  console.log(`--- 1. スプレッドシート上の全シート タブ並び順 (インデックス 1〜) ---`);
  if (json.actualSheetsInOrder) {
    json.actualSheetsInOrder.forEach(s => {
      console.log(`  [シート #${s.index.toString().padStart(2, ' ')}] 名前: "${s.name.padEnd(16, ' ')}" | 非表示: ${s.isHidden}`);
    });
  }

  console.log(`\n--- 2. extractDistrictAddresses() 抽出データの先頭 20 件 ---`);
  if (json.top20Extracted) {
    json.top20Extracted.forEach(item => {
      console.log(`  [#${item.index.toString().padStart(2, ' ')}] 市町村: "${item.city.padEnd(8, ' ')}" | 住所: "${item.address}"`);
    });
  }

  console.log(`\n--- 3. __TEMP_ADDRESSES__ シートの生データ先頭 20 行 ---`);
  if (json.top20TempSheetRows && json.top20TempSheetRows.length > 0) {
    json.top20TempSheetRows.forEach(r => {
      console.log(`  [行 #${r.row.toString().padStart(2, ' ')}] 抽出市町村: "${r.extractedCity.padEnd(8, ' ')}" | 住所: "${r.address}"`);
    });
  } else {
    console.log(`  (※ __TEMP_ADDRESSES__ シートはバッチ完走後に自動消去された状態です)`);
  }

  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Order Audit Error:", err.message);
  process.exit(1);
});
