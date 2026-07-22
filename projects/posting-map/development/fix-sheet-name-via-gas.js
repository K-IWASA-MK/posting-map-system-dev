/**
 * POSTING MAP - Spreadsheet Title Fix & Sheet Name Restoration via GAS
 * Sets Spreadsheet File Title to "MIE-03 v1" and keeps original sheet names intact.
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";
const SPREADSHEET_ID = "1xQUvlCaUO103rjSGmdcFQQFkukodG4Dg9mS_teWT7uA";
const FILE_TITLE = "MIE-03 v1";

async function main() {
  console.log(`📡 Sending fixTitle request to GAS WebApp Engine...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&fixTitle=true&spreadsheetId=${SPREADSHEET_ID}&title=${encodeURIComponent(FILE_TITLE)}`;
  
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
    console.log(`🎉 Spreadsheet File Title fixed to "${FILE_TITLE}"!`);
  } else {
    console.error(`❌ Fix title failed:`, json.message);
  }
}

main().catch(err => {
  console.error("❌ Fix error:", err.message);
  process.exit(1);
});
