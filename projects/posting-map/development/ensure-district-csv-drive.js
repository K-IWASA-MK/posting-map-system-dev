/**
 * POSTING MAP - Ensure District CSV on Google Drive & Get File ID
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT_FOLDER_ID = "1FfcVEQjod--rZSucOPFJD2DJ58hV650_";
const PLATFORM_DIR = path.join(__dirname, '..', 'FIELD_OPERATIONS_PLATFORM');

async function getClaspToken() {
  const claspRcPath = path.join(os.homedir(), '.clasprc.json');
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
  const data = await res.json();
  return data.access_token;
}

async function findFolder(name, parentId, token) {
  const query = `'${parentId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
}

async function findFile(name, parentId, token) {
  const query = `'${parentId}' in parents and name = '${name}' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
}

async function uploadFile(filePath, fileName, parentId, token) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const existingId = await findFile(fileName, parentId, token);
  if (existingId) {
    console.log(`📌 Existing File ID for ${fileName}: ${existingId}`);
    return existingId;
  }

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const metadata = {
    name: fileName,
    parents: [parentId],
    mimeType: 'text/csv'
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/csv; charset=UTF-8\r\n\r\n' +
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
  const data = await res.json();
  console.log(`✅ Uploaded new District CSV: ${fileName} -> File ID: ${data.id}`);
  return data.id;
}

async function main() {
  const token = await getClaspToken();
  let masterFolderId = await findFolder('01_MASTER', ROOT_FOLDER_ID, token);
  let refFolderId = await findFolder('Reference', masterFolderId, token);
  if (!refFolderId) {
    const url = `https://www.googleapis.com/drive/v3/files`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Reference', mimeType: 'application/vnd.google-apps.folder', parents: [masterFolderId] })
    });
    const data = await res.json();
    refFolderId = data.id;
  }

  const localCsvPath = path.join(PLATFORM_DIR, '01_MASTER', 'Reference', '三重県選挙区区割り.csv');
  const fileId = await uploadFile(localCsvPath, '三重県選挙区区割り.csv', refFolderId, token);
  console.log(`\n🎯 DISTRICT_CSV_FILE_ID: "${fileId}"`);
}

main().catch(err => {
  console.error("❌ Drive Error:", err.message);
  process.exit(1);
});
