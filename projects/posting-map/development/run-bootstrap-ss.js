/**
 * POSTING MAP - Bootstrap Script Properties with target Spreadsheet ID (MIE-03 v1)
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxyHvUbJ3yVwXX8sIdK_mWb6ML5ChmFX3mfv-nlEv1DDCv30hBQJlngM096_zLW04vQ/exec";

async function main() {
  console.log(`📡 Bootstrapping SPREADSHEET_ID to "1xQUvlCaUO103rjSGmdcFQQFkukodG4Dg9mS_teWT7uA"...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&bootstrapProperties=true&spreadsheetId=1xQUvlCaUO103rjSGmdcFQQFkukodG4Dg9mS_teWT7uA&districtId=MIE-03`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const json = await res.json();

  console.log(`\n========================================`);
  console.log(`🔧 【ScriptProperties Bootstrap 実行結果】`);
  console.log(`========================================`);
  console.log(`ステータス : ${json.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`メッセージ : ${json.message || json.data?.message}`);
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Bootstrap Error:", err.message);
  process.exit(1);
});
