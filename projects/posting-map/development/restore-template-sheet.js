/**
 * POSTING MAP - Restore Template Sheet Runner
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Triggering createTemplateSheet() on Spreadsheet via GAS WebApp...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&restoreTemplate=true`;
  
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse response: ${text}`);
  }

  console.log(`\n========================================`);
  console.log(`🎨 【Sprint: Template Recovery 結果報告】`);
  console.log(`========================================`);
  console.log(`ステータス : ${json.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`メッセージ : ${json.message || json.data?.message}`);
  if (json.data?.templateName) {
    console.log(`復元シート名: "${json.data.templateName}"`);
  }
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Restore Error:", err.message);
  process.exit(1);
});
