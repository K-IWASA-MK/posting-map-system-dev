/**
 * POSTING MAP - Postal Order Fact Check
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Checking exact Postal Code numbers from actual sheets...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&inspectSequence=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const rawJson = await res.json();
  const json = rawJson.data || rawJson;

  console.log(`\n========================================`);
  console.log(`🔍 【郵便番号順ファクトチェック】`);
  console.log(`========================================\n`);

  console.log(`--- 1. 全抽出データ先頭 15件の郵便番号と市町村 ---`);
  if (json.top20Extracted) {
    json.top20Extracted.slice(0, 15).forEach(item => {
      console.log(`  [#${item.index.toString().padStart(2, ' ')}] 〒${item.postalCode.padEnd(8, ' ')} | 自治体: "${item.city.padEnd(6, ' ')}" | 住所: ${item.address}`);
    });
  }

  console.log(`\n========================================\n`);
}

main().catch(err => {
  console.error("❌ Fact Check Error:", err.message);
  process.exit(1);
});
