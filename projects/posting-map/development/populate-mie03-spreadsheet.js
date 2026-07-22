/**
 * POSTING MAP - Phase 2-2: Populate Extracted Data into Spreadsheet (MIE-03 v1)
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";
const SPREADSHEET_ID = "1xQUvlCaUO103rjSGmdcFQQFkukodG4Dg9mS_teWT7uA";

async function main() {
  const gid = "1893108169";
  console.log(`📡 Sending populateData request to GAS WebApp Engine for Spreadsheet ${SPREADSHEET_ID} (gid: ${gid})...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&populateData=true&spreadsheetId=${SPREADSHEET_ID}&gid=${gid}`;
  
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const text = await res.text();
  console.log(`GAS Response:`, text);

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse GAS response: ${text}`);
  }

  if (json.success) {
    console.log(`🎉 District Data successfully populated into Spreadsheet "MIE-03 v1"!`);
  } else {
    console.error(`❌ Populate district data failed:`, json.message);
  }
}

main().catch(err => {
  console.error("❌ Populate error:", err.message);
  process.exit(1);
});
