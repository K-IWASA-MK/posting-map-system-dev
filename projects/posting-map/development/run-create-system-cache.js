/**
 * POSTING MAP - Trigger createSystemCacheSheet() via WebApp API
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Triggering createSystemCacheSheet() on Spreadsheet...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&rebuildCache=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const json = await res.json();

  console.log(`\n========================================`);
  console.log(`📊 【createSystemCacheSheet 実行結果】`);
  console.log(`========================================`);
  console.log(`ステータス : ${json.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`メッセージ : ${json.message || json.data?.message}`);
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Rebuild Cache Error:", err.message);
  process.exit(1);
});
