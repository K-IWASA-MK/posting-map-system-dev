/**
 * POSTING MAP
 * Phase 32: Provisioning Rollback & Cleanup Utility
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

async function getClaspToken() {
  const claspRcPath = path.join(os.homedir(), '.clasprc.json');
  if (!fs.existsSync(claspRcPath)) {
    throw new Error("clasp is not logged in. Please run 'clasp login' first.");
  }
  const rc = JSON.parse(fs.readFileSync(claspRcPath, 'utf8'));
  const def = rc.tokens.default;
  
  // Check if token is still valid (with a 5-minute buffer)
  if (def.expiry_date && Date.now() < def.expiry_date - 300000) {
    return def.access_token;
  }
  
  console.log("OAuth access token expired or close to expiry. Refreshing...");
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
  
  // Save refreshed token back to ~/.clasprc.json
  fs.writeFileSync(claspRcPath, JSON.stringify(rc, null, 2), 'utf8');
  console.log("✓ Access token successfully refreshed.");
  return data.access_token;
}

async function deleteDriveFile(fileId, token) {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.status === 204 || res.status === 200) {
    console.log(`✓ Deleted file/folder from Drive: ${fileId}`);
    return true;
  }
  console.warn(`⚠️ Failed to delete Drive resource ${fileId}: HTTP Status ${res.status}`);
  return false;
}

async function rollbackManifest() {
  const manifestPath = path.join(__dirname, '..', 'deployment.json');
  if (!fs.existsSync(manifestPath)) {
    console.log("No manifest found to rollback.");
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const status = manifest.provisioning ? manifest.provisioning.status : "UNKNOWN";
  
  if (status === "READY") {
    console.log("Cannot rollback a completed READY deployment transaction.");
    return;
  }

  console.log(`Starting rollback for transaction: ${manifest.provisioning.transactionId}...`);
  try {
    const resources = manifest.resources || {};
    const webAppUrl = resources.webAppUrl || "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";
    
    if (resources.spreadsheetId || resources.storageFolderId) {
      console.log("Triggering remote resources cleanup on Web App...");
      const cleanupUrl = `${webAppUrl}?action=verifyDeployment&apiKey=valid-api-key&cleanupResources=true&spreadsheetId=${resources.spreadsheetId || ""}&storageFolderId=${resources.storageFolderId || ""}`;
      const res = await fetch(cleanupUrl, { method: 'GET', redirect: 'follow' });
      const text = await res.text();
      console.log(`Remote cleanup output: ${text.substring(0, 200)}`);
    }
    
    // Reset resources inside manifest
    manifest.resources = {
      spreadsheetId: "",
      storageFolderId: "",
      scriptId: "",
      webAppUrl: ""
    };
    manifest.provisioning.status = "ROLLED_BACK";
    manifest.certification.phase31 = "PENDING";
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log("✓ Manifest successfully rolled back.");
  } catch (err) {
    console.error("❌ Rollback failed: " + err.toString());
  }
}

// Direct CLI execution
if (require.main === module) {
  rollbackManifest();
}

module.exports = { rollbackManifest, deleteDriveFile, getClaspToken };
