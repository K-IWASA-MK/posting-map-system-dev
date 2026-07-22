/**
 * POSTING MAP - Tab Sequence Fact Check
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwy8RZPeQKfwmM_zObRDFpjL-SKWyN_3tAWjK29oWQ6l_QB2rO7_9vqZBM4MBfHcyoa/exec";

async function main() {
  console.log(`📡 Fetching actual Spreadsheet Tab Names & Sequence...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&auditAllAreas=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const rawJson = await res.json();
  const json = rawJson.data || rawJson;

  console.log(`\n========================================`);
  console.log(`📑 【スプレッドシート タブ並び順 リアルタイム実測結果】`);
  console.log(`========================================`);
  console.log(`総エリアシート数: ${json.totalAreaSheets} シート\n`);

  if (json.sheets) {
    json.sheets.forEach((s, idx) => {
      console.log(`  [Tab #${(idx + 1).toString().padStart(2, ' ')}] シート名: "${s.name}" (行数: ${s.rowsCount})`);
    });
  }
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Tab Check Error:", err.message);
  process.exit(1);
});
