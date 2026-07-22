/**
 * POSTING MAP - Phase 2-1: Branch Provisioning Script
 * 1. Calls GAS Provisioning Engine to duplicate MASTER Spreadsheet (14rblnvJH5hkXHU9-9lhZlDaUi-FenuQQ5DWnTP7TbW4)
 * 2. Creates & moves copied Spreadsheet as "MIE-03" in Drive folder 03_BRANCH/MIE-03
 * 3. Renames the initial sheet "MASTER" -> "MIE-03 v1"
 * 4. Saves deployment.json & syncs with Google Drive
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT_FOLDER_ID = "1FfcVEQjod--rZSucOPFJD2DJ58hV650_";
const PLATFORM_DIR = path.join(__dirname, '..', 'FIELD_OPERATIONS_PLATFORM');
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

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

async function findFolder(name, parentId, token) {
  const query = `'${parentId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive list error: ${res.statusText}`);
  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
}

async function main() {
  const branchId = "MIE-03";
  const masterVersionMajor = "1";
  const sheetName = `${branchId} v${masterVersionMajor}`;
  const displayName = "三重第3支部";

  console.log(`🚀 Executing Phase 2-1: Branch Creation for ${branchId} (${displayName})...`);

  // Step 1: Call GAS Engine to provision spreadsheet & rename initial sheet to MIE-03 v1
  console.log(`📡 Requesting GAS Remote Engine to duplicate MASTER spreadsheet...`);
  const initUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&provisionDistrict=true&districtId=${branchId}`;
  const initRes = await fetch(initUrl, { method: 'GET', redirect: 'follow' });
  const initText = await initRes.text();

  let initJson;
  try {
    initJson = JSON.parse(initText);
  } catch (e) {
    throw new Error(`Failed to parse GAS response: ${initText}`);
  }

  if (!initJson.success || !initJson.data || !initJson.data.success) {
    throw new Error(`GAS Remote Provisioning failed: ${JSON.stringify(initJson)}`);
  }

  const resources = initJson.data.resources;
  const newSpreadsheetId = resources.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`;

  console.log(`✅ Master Spreadsheet Duplicated Successfully via GAS!`);
  console.log(`📌 New Spreadsheet Name: ${branchId}`);
  console.log(`📌 Initial Sheet Name: ${sheetName}`);
  console.log(`📌 Spreadsheet ID: ${newSpreadsheetId}`);
  console.log(`📌 Spreadsheet URL: ${spreadsheetUrl}`);

  // Step 2: Ensure Drive 03_BRANCH/MIE-03 folder alignment
  const token = await getClaspToken();
  let branchFolderId = await findFolder('03_BRANCH', ROOT_FOLDER_ID, token);
  let mie03FolderId = await findFolder(branchId, branchFolderId, token);

  // Step 3: Save Deployment Manifests locally
  const deploymentPath = path.join(PLATFORM_DIR, '03_BRANCH', branchId, 'deployment.json');
  const clientDeploymentPath = path.join(__dirname, '..', 'clients', branchId, 'deployment.json');

  const deploymentData = {
    branchId: branchId,
    masterVersion: "1.0.0",
    createdFrom: "POSTING MAP MASTER",
    district: {
      id: branchId,
      name: displayName,
      sheetName: sheetName,
      displayName: displayName
    },
    resources: {
      spreadsheetId: newSpreadsheetId,
      spreadsheetUrl: spreadsheetUrl,
      storageFolderId: resources.storageFolderId || mie03FolderId,
      scriptId: "158Avw8hAtZx-c9yW10DE0NzB1NYngwv31eroqn-IAmHh_eKHN_fR58sa",
      webAppUrl: WEB_APP_URL,
      googleDrive: {
        rootFolderId: ROOT_FOLDER_ID,
        branchFolderId: mie03FolderId,
        url: `https://drive.google.com/drive/folders/${mie03FolderId}`
      }
    },
    provisioning: {
      phase: "Phase 2-1",
      masterVersion: "1.0.0",
      copiedFromMaster: "POSTING MAP MASTER",
      createdAt: new Date().toISOString(),
      createdBy: "CEO/AI Governance",
      status: "BRANCH_CREATED_READY_FOR_DATA"
    },
    uiConfig: {
      sheetName: sheetName,
      displayName: displayName,
      dashboardTitle: `${displayName} ポスティングダッシュボード`,
      pdfTitle: `${displayName} 配布完了報告書`,
      lineNotificationPrefix: `[${displayName}]`
    }
  };

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2), 'utf8');
  console.log(`✅ Saved deployment manifest to: ${deploymentPath}`);

  if (fs.existsSync(clientDeploymentPath)) {
    fs.writeFileSync(clientDeploymentPath, JSON.stringify(deploymentData, null, 2), 'utf8');
    console.log(`✅ Saved client deployment manifest to: ${clientDeploymentPath}`);
  }

  console.log(`\n🎉 Phase 2-1 Branch Creation Completed!`);
  console.log(`📌 Branch ID: ${branchId}`);
  console.log(`📌 Sheet Name: ${sheetName}`);
  console.log(`📌 Spreadsheet ID: ${newSpreadsheetId}`);
  console.log(`📌 Spreadsheet URL: ${spreadsheetUrl}`);
}

main().catch(err => {
  console.error('❌ Error during Phase 2-1 Branch Creation:', err.message);
  process.exit(1);
});
