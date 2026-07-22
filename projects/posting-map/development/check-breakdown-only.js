/**
 * POSTING MAP - Sprint B-1 Extract Breakdown Only Inspector
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Fetching Address Extraction Breakdown for Sprint B-1...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&testExtractBreakdown=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const rawJson = await res.json();
  const json = rawJson.data || rawJson;

  console.log(`\n========================================`);
  console.log(`📊 【Sprint B-1: 抽出件数 & 自治体別内訳】`);
  console.log(`========================================`);
  console.log(`総抽出件数           : ${json.totalItems || 0} 件 (修正前 317件 ➔ ＋${(json.totalItems || 0) - 317}件)`);
  console.log(`\n--- 自治体別内訳件数 ---`);
  const bd = json.breakdown || {};
  Object.keys(bd).sort().forEach(city => {
    console.log(`  - ${city.padEnd(14, ' ')} : ${bd[city]} 件`);
  });
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Breakdown Fetch Error:", err.message);
  process.exit(1);
});
