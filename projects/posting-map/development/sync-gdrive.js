/**
 * POSTING MAP - Google Drive Synchronizer
 * Syncs local FIELD_OPERATIONS_PLATFORM (01_MASTER, 01_MASTER/Archive & 03_BRANCH/MIE-03) to Google Drive Folder (1FfcVEQjod--rZSucOPFJD2DJ58hV650_)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT_FOLDER_ID = "1FfcVEQjod--rZSucOPFJD2DJ58hV650_";
const MASTER_SPREADSHEET_ID = "14rblnvJH5hkXHU9-9lhZlDaUi-FenuQQ5DWnTP7TbW4";
const PLATFORM_DIR = path.join(__dirname, '..', 'FIELD_OPERATIONS_PLATFORM');

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

async function createFolder(name, parentId, token) {
  const url = `https://www.googleapis.com/drive/v3/files`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    })
  });
  if (!res.ok) throw new Error(`Failed to create folder ${name}: ${res.statusText}`);
  const data = await res.json();
  return data.id;
}

async function findFile(name, parentId, token) {
  const query = `'${parentId}' in parents and name = '${name}' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive file search error: ${res.statusText}`);
  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
}

async function uploadOrUpdateFile(filePath, fileName, parentId, token) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const existingId = await findFile(fileName, parentId, token);

  if (existingId) {
    const url = `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: fileContent
    });
    if (!res.ok) throw new Error(`Failed to update file ${fileName}: ${res.statusText}`);
    console.log(`✅ Updated existing Drive file: ${fileName} (ID: ${existingId})`);
    return existingId;
  } else {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
      name: fileName,
      parents: [parentId],
      mimeType: 'application/json'
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      fileContent +
      close_delim;

    const url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/related; boundary=' + boundary
      },
      body: multipartRequestBody
    });
    if (!res.ok) throw new Error(`Failed to upload file ${fileName}: ${res.statusText}`);
    const data = await res.json();
    console.log(`✅ Uploaded new Drive file: ${fileName} (ID: ${data.id})`);
    return data.id;
  }
}

async function ensureMasterSpreadsheetShortcut(masterFolderId, token) {
  const shortcutName = "POSTING MAP MASTER スプレッドシート";
  const existingId = await findFile(shortcutName, masterFolderId, token);
  if (!existingId) {
    console.log(`🔗 Creating shortcut for Master Spreadsheet inside 01_MASTER folder on Drive...`);
    const url = `https://www.googleapis.com/drive/v3/files`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: shortcutName,
        mimeType: 'application/vnd.google-apps.shortcut',
        parents: [masterFolderId],
        shortcutDetails: {
          targetId: MASTER_SPREADSHEET_ID
        }
      })
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Created Master Spreadsheet Shortcut inside 01_MASTER (ID: ${data.id})`);
    } else {
      console.log(`⚠️ Shortcut creation status: ${res.statusText}`);
    }
  } else {
    console.log(`✅ Master Spreadsheet Shortcut already exists inside 01_MASTER (ID: ${existingId})`);
  }
}

async function main() {
  console.log(`🚀 Syncing local FIELD_OPERATIONS_PLATFORM to Google Drive (${ROOT_FOLDER_ID})...`);
  const token = await getClaspToken();

  // 1. Ensure 01_MASTER folder in Drive
  let masterFolderId = await findFolder('01_MASTER', ROOT_FOLDER_ID, token);
  if (!masterFolderId) {
    console.log('📁 Creating 01_MASTER folder on Drive...');
    masterFolderId = await createFolder('01_MASTER', ROOT_FOLDER_ID, token);
  }
  console.log(`📌 01_MASTER Folder ID: ${masterFolderId}`);

  // Upload 01_MASTER files
  const masterJsonPath = path.join(PLATFORM_DIR, '01_MASTER', 'POSTING_MAP_MASTER.json');
  if (fs.existsSync(masterJsonPath)) {
    await uploadOrUpdateFile(masterJsonPath, 'POSTING_MAP_MASTER.json', masterFolderId, token);
  }

  // Create shortcut to Master Spreadsheet in 01_MASTER
  await ensureMasterSpreadsheetShortcut(masterFolderId, token);

  // Ensure 01_MASTER/Archive folder in Drive
  let archiveFolderId = await findFolder('Archive', masterFolderId, token);
  if (!archiveFolderId) {
    console.log('📁 Creating Archive folder inside 01_MASTER on Drive...');
    archiveFolderId = await createFolder('Archive', masterFolderId, token);
  }
  console.log(`📌 01_MASTER/Archive Folder ID: ${archiveFolderId}`);

  // 2. Ensure 03_BRANCH folder in Drive
  let branchFolderId = await findFolder('03_BRANCH', ROOT_FOLDER_ID, token);
  if (!branchFolderId) {
    console.log('📁 Creating 03_BRANCH folder on Drive...');
    branchFolderId = await createFolder('03_BRANCH', ROOT_FOLDER_ID, token);
  }
  console.log(`📌 03_BRANCH Folder ID: ${branchFolderId}`);

  // 3. Ensure MIE-03 folder in 03_BRANCH
  let mie03FolderId = await findFolder('MIE-03', branchFolderId, token);
  if (!mie03FolderId) {
    console.log('📁 Creating MIE-03 folder inside 03_BRANCH on Drive...');
    mie03FolderId = await createFolder('MIE-03', branchFolderId, token);
  }
  console.log(`📌 03_BRANCH/MIE-03 Folder ID: ${mie03FolderId}`);

  // Upload MIE-03 deployment.json
  const mie03DeploymentPath = path.join(PLATFORM_DIR, '03_BRANCH', 'MIE-03', 'deployment.json');
  if (fs.existsSync(mie03DeploymentPath)) {
    await uploadOrUpdateFile(mie03DeploymentPath, 'deployment.json', mie03FolderId, token);
  }

  console.log('\n🎉 Google Drive Governance & Sync Completed Successfully!');
}

main().catch(err => {
  console.error('❌ Sync Error:', err.message);
  process.exit(1);
});
