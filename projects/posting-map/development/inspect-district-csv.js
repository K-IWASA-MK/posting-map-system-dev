/**
 * POSTING MAP - Inspect District CSV Rules & Postal CSV Cities Count
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Inspecting District CSV Rules & Postal CSV Data...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&inspectCsvRules=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const rawJson = await res.json();
  const json = rawJson.data || rawJson;

  console.log(`\n========================================`);
  console.log(`🔍 【区割りCSV & 郵便番号CSV 調査レポート】`);
  console.log(`========================================`);
  console.log(`使用区割りファイル : ${json.districtFileName}`);
  
  if (json.districtRows) {
    console.log(`\n--- 🔹 [区割りCSV 内の三重第3区 ルール定義 (全 ${json.districtRows.length} 行)] ---`);
    json.districtRows.forEach((row, idx) => {
      if (row && (row[0] === '三重第3区' || row[0] === '第3区' || row[0] === '3区' || row[0]?.includes('3'))) {
        console.log(`  [行 ${idx + 1}] 選挙区: "${row[0]}" | 都道府県: "${row[1]}" | 市区町村: "${row[2]}" | 対象地域: "${row[3] || '(全域)'}"`);
      }
    });
  }

  if (json.mieCitiesCount) {
    console.log(`\n--- 🔹 [郵便番号データ(KEN_ALL.CSV) 内の三重県市町村別件数 (全 ${Object.keys(json.mieCitiesCount).length} 市町村)] ---`);
    const targetKeywords = ["四日市市", "桑名市", "いなべ市", "木曽岬町", "東員町", "菰野町", "朝日町", "川越町"];
    Object.keys(json.mieCitiesCount).sort().forEach(city => {
      const isTarget = targetKeywords.some(tc => city.includes(tc));
      console.log(`  - ${city.padEnd(12, ' ')} : ${json.mieCitiesCount[city]} 件 ${isTarget ? '👈 (3区対象自治体)' : ''}`);
    });
  }

  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Inspect CSV Error:", err.message);
  process.exit(1);
});
