/**
 * POSTING MAP - Sheet Name Verification & Fix Script
 * Verifies and directly renames the first sheet of MIE-03 Spreadsheet (1xQUvlCaUO103rjSGmdcFQQFkukodG4Dg9mS_teWT7uA) to "MIE-03 v1".
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SPREADSHEET_ID = "1xQUvlCaUO103rjSGmdcFQQFkukodG4Dg9mS_teWT7uA";
const TARGET_SHEET_NAME = "MIE-03 v1";

async function getClaspToken() {
  const claspRcPath = path.join(os.homedir(), '.clasprc.json');
  if (!fs.existsSync(claspRcPath)) {
    throw new Error("clasp is not logged in. Please run 'clasp login' first.");
  }
  const rc = JSON.parse(fs.readFileSync(claspRcPath, 'utf8'));
  const def = rc.tokens.default;
  
  if (def.expiry_date && Date.now() < def.expiry_date - 300000) {
    return def.access_token;
  }
  
  const refreshUrl = "https://oauth2.googleapis.com/token";
  const res = await fetch(refreshUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: def.client_id,
      client_secret: def.client_secret,
      refresh_token: def.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  
  if (!res.ok) {
    throw new Error(`Failed to refresh OAuth token: ${res.statusText}`);
  }
  
  const data = await res.json();
  def.access_token = data.access_token;
  if (data.expires_in) {
    def.expiry_date = Date.now() + (data.expires_in * 1000);
  }
  
  fs.writeFileSync(claspRcPath, JSON.stringify(rc, null, 2), 'utf8');
  return data.access_token;
}

async function fixSheetName() {
  console.log(`🔍 Inspecting Spreadsheet ${SPREADSHEET_ID}...`);
  const token = await getClaspToken();

  // 1. Get sheets metadata
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties`;
  const getRes = await fetch(getUrl, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!getRes.ok) throw new Error(`Sheets metadata fetch error: ${getRes.statusText}`);
  const ssData = await getRes.json();

  console.log(`📋 Found ${ssData.sheets ? ssData.sheets.length : 0} sheets:`);
  ssData.sheets.forEach((s, idx) => {
    console.log(`  [${idx}] Sheet ID: ${s.properties.sheetId}, Title: "${s.properties.title}"`);
  });

  const firstSheet = ssData.sheets[0];
  const firstSheetId = firstSheet.properties.sheetId;
  const currentTitle = firstSheet.properties.title;

  if (currentTitle === TARGET_SHEET_NAME) {
    console.log(`✅ First sheet title is already "${TARGET_SHEET_NAME}".`);
    return;
  }

  console.log(`✏️ Changing sheet title from "${currentTitle}" -> "${TARGET_SHEET_NAME}"...`);
  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`;
  const updateRes = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [{
        updateSheetProperties: {
          properties: {
            sheetId: firstSheetId,
            title: TARGET_SHEET_NAME
          },
          fields: 'title'
        }
      }]
    })
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Failed to update sheet title: ${updateRes.statusText} (${errText})`);
  }

  console.log(`🎉 Sheet title successfully renamed to "${TARGET_SHEET_NAME}"!`);
}

fixSheetName().catch(err => {
  console.error("❌ Sheet fix error:", err.message);
  process.exit(1);
});
