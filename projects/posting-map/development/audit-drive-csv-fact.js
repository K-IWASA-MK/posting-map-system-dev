/**
 * POSTING MAP - Sheet Names Fact Checker
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwy8RZPeQKfwmM_zObRDFpjL-SKWyN_3tAWjK29oWQ6l_QB2rO7_9vqZBM4MBfHcyoa/exec";

async function main() {
  console.log(`📡 Inspecting all sheet names in target Spreadsheet...`);
  
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&inspectSheetNames=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const json = await res.json();
  
  console.log(`\n========================================`);
  console.log(`🔍 【スプレッドシート内 全シート名ファクト】`);
  console.log(`========================================`);
  console.log(JSON.stringify(json, null, 2));
  console.log(`========================================\n`);
}

main().catch(err => console.error("Error:", err.message));
