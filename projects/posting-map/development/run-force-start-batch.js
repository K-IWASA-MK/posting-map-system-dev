/**
 * POSTING MAP - Trigger forceStartBatch() via WebApp API
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`🚀 Triggering forceStartBatch() on Spreadsheet...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&triggerBatch=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const json = await res.json();

  console.log(`\n========================================`);
  console.log(`🚀 【forceStartBatch 起動レスポンス】`);
  console.log(`========================================`);
  console.log(`ステータス : ${json.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`メッセージ : ${json.message || json.data?.message}`);
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Batch Start Error:", err.message);
  process.exit(1);
});
