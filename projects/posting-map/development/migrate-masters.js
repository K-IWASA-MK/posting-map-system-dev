/**
 * POSTING MAP
 * Master Reference Data Migration Utility
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// Standard Paths
const REGISTRY_PATH = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'AssetRegistry.json');
const GS_PATH = path.join(__dirname, '..', 'active', 'api', 'AssetRegistry.gs');
const REPORT_PATH = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'MasterReferenceRegistrationReport.md');
const MAIN_REPORT_PATH = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'MigrationReport.md');

// Target Files
const POSTAL_CSV_PATH = path.join(__dirname, '..', 'reference', 'KEN_ALL.CSV');
const ADDRESS_CSV_PATH = path.join(__dirname, '..', 'reference', 'postal.csv');

// Folder Constants
const ROOT_FOLDER_ID = "1FfcVEQjod--rZSucOPFJD2DJ58hV650_"; // FIELD_OPERATIONS_PLATFORM

async function getClaspToken() {
  const claspRcPath = path.join(os.homedir(), '.clasprc.json');
  if (!fs.existsSync(claspRcPath)) {
    throw new Error(`Clasp configuration not found at: ${claspRcPath}. Please run clasp login first.`);
  }

  const rc = JSON.parse(fs.readFileSync(claspRcPath, 'utf8'));
  const def = rc.tokens.default;
  
  if (def.expiry_date && Date.now() < def.expiry_date - 300000) {
    return def.access_token;
  }
  
  console.log("Refreshing Google OAuth token...");
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

async function driveFetch(endpoint, token, options = {}) {
  const url = `https://www.googleapis.com/drive/v3/${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive API Error [${res.status}]: ${text}`);
  }
  if (res.status === 204) return null;
  return await res.json();
}

// Global search by name and parent ID check to avoid 404 query crash
async function getFolderByNameAndParent(name, parentId, token) {
  const subSearchQ = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const subSearchRes = await driveFetch(`files?q=${encodeURIComponent(subSearchQ)}&fields=files(id,name,parents)`, token);
  return (subSearchRes.files || []).find(f => f.parents && f.parents.includes(parentId)) || null;
}

async function createFolder(name, parentId, token) {
  const existing = await getFolderByNameAndParent(name, parentId, token);
  if (existing) {
    console.log(`  ✓ Subfolder "${name}" already exists: ${existing.id}`);
    return existing.id;
  }

  console.log(`  Creating subfolder "${name}" under ${parentId}...`);
  const createRes = await driveFetch(`files`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId]
    })
  });
  console.log(`  ✓ Created subfolder "${name}": ${createRes.id}`);
  return createRes.id;
}

// Binary-safe multipart upload to Drive
async function uploadFile(filePath, mimeType, parentId, token) {
  const name = path.basename(filePath);
  console.log(`  Uploading ${name} to Drive parent: ${parentId}...`);

  // Calculate metadata hash locally
  const fileContent = fs.readFileSync(filePath);
  
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const metadata = {
    name,
    parents: [parentId]
  };

  const metadataPart = 
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n`;

  const fileHeader = 
    `Content-Type: ${mimeType}\r\n\r\n`;

  const payload = Buffer.concat([
    Buffer.from(delimiter, 'utf8'),
    Buffer.from(metadataPart, 'utf8'),
    Buffer.from(delimiter, 'utf8'),
    Buffer.from(fileHeader, 'utf8'),
    fileContent,
    Buffer.from(closeDelim, 'utf8')
  ]);

  const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`,
      'Content-Length': payload.length
    },
    body: payload
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.statusText} - ${text}`);
  }

  const result = await res.json();
  console.log(`  ✓ Successfully uploaded ${name} (ID: ${result.id})`);
  return result.id;
}

function getFileMetadata(filePath) {
  const stats = fs.statSync(filePath);
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return {
    fileName: path.basename(filePath),
    size: stats.size,
    hash: hash.digest('hex'),
    currentPath: filePath
  };
}

async function main() {
  console.log("🚀 Starting Master Reference Data Migration...");
  
  try {
    const token = await getClaspToken();

    // 1. File Detection & Local Metadata calculation
    console.log("\n🔍 Detecting local reference master files...");
    if (!fs.existsSync(POSTAL_CSV_PATH)) {
      throw new Error(`Postal CSV not found at: ${POSTAL_CSV_PATH}`);
    }
    if (!fs.existsSync(ADDRESS_CSV_PATH)) {
      throw new Error(`Address CSV not found at: ${ADDRESS_CSV_PATH}`);
    }

    const postalMeta = getFileMetadata(POSTAL_CSV_PATH);
    const addressMeta = getFileMetadata(ADDRESS_CSV_PATH);

    console.log(`  ✓ Postal Master: ${postalMeta.fileName} (${postalMeta.size} bytes, SHA-256: ${postalMeta.hash.substring(0, 10)}...)`);
    console.log(`  ✓ Address Master: ${addressMeta.fileName} (${addressMeta.size} bytes, SHA-256: ${addressMeta.hash.substring(0, 10)}...)`);

    // 2. Resolve target directories in Google Drive
    console.log("\n📂 Resolving target directories in Google Drive...");
    const masterFolder = await getFolderByNameAndParent("01_MASTER", ROOT_FOLDER_ID, token);
    if (!masterFolder) {
      throw new Error(`01_MASTER folder not found under root FIELD_OPERATIONS_PLATFORM.`);
    }

    const referenceFolder = await getFolderByNameAndParent("Reference", masterFolder.id, token);
    if (!referenceFolder) {
      throw new Error(`Reference subfolder not found under 01_MASTER.`);
    }

    console.log(`  ✓ Resolved 01_MASTER/Reference: ${referenceFolder.id}`);
    
    // Create subfolders: Address and Postal
    const addressFolderId = await createFolder("Address", referenceFolder.id, token);
    const postalFolderId = await createFolder("Postal", referenceFolder.id, token);

    // 3. Upload files to Drive
    console.log("\n📤 Uploading master reference CSVs to Google Drive...");
    const postalFileId = await uploadFile(POSTAL_CSV_PATH, "text/csv", postalFolderId, token);
    const addressFileId = await uploadFile(ADDRESS_CSV_PATH, "text/csv", addressFolderId, token);

    // 4. Update AssetRegistry.json
    console.log("\n📝 Updating AssetRegistry.json...");
    if (!fs.existsSync(REGISTRY_PATH)) {
      throw new Error(`AssetRegistry.json not found at: ${REGISTRY_PATH}`);
    }

    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    
    // Migrate old branches array to new districts structure if present
    const districts = {};
    if (registry.branches) {
      registry.branches.forEach(b => {
        districts[b.id] = {
          spreadsheetId: b.spreadsheetId || "",
          storageFolderId: b.storageFolderId || "",
          gasScriptId: b.id === "MIE-03" ? (registry.templates.scriptId || "") : ""
        };
      });
      delete registry.branches;
    }

    // Ensure MIE-03 is mapped as a district too
    if (!districts["MIE-03"]) {
      districts["MIE-03"] = {
        spreadsheetId: registry.templates.spreadsheetId || "",
        storageFolderId: "",
        gasScriptId: registry.templates.scriptId || ""
      };
    }

    // Keep election master spreadsheet ID if present
    const existingElectionId = registry.masters ? (registry.masters.electionSpreadsheetId || "") : "";

    registry.masters = {
      global: {
        postalMaster: {
          fileId: postalFileId,
          name: postalMeta.fileName,
          location: "01_MASTER/Reference/Postal",
          version: "2026-07",
          source: "日本郵便",
          checksum: postalMeta.hash,
          updatedAt: new Date().toISOString()
        },
        addressMaster: {
          fileId: addressFileId,
          name: addressMeta.fileName,
          location: "01_MASTER/Reference/Address",
          version: "2026-07",
          source: "日本郵便",
          checksum: addressMeta.hash,
          updatedAt: new Date().toISOString()
        },
        electionMaster: {
          fileId: existingElectionId,
          name: "三重県選挙区区割り.csv",
          location: "01_MASTER/Reference"
        }
      },
      districts
    };

    registry.updatedAt = Date.now();

    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf8');
    console.log("  ✓ Updated AssetRegistry.json successfully.");

    // 5. Update AssetRegistry.gs template
    console.log("\n📝 Updating AssetRegistry.gs...");
    const gsCode = `/**
 * Auto-generated AssetRegistry
 * Static workspace locator for AIOS Core
 */
function getAssetRegistry() {
  return ${JSON.stringify(registry, null, 2)};
}

function getTemplateSpreadsheetId() {
  return "${registry.templates.spreadsheetId || ""}";
}

function getTemplateScriptId() {
  return "${registry.templates.scriptId || ""}";
}

function getTemplateWebAppUrl() {
  return "${registry.templates.webAppUrl || ""}";
}

function getPostalMaster() {
  return getAssetRegistry().masters.global.postalMaster || null;
}

function getAddressMaster() {
  return getAssetRegistry().masters.global.addressMaster || null;
}

function getElectionMaster() {
  return getAssetRegistry().masters.global.electionMaster || null;
}

function getDistrictAssets(districtId) {
  return getAssetRegistry().masters.districts[districtId] || null;
}
`;
    fs.writeFileSync(GS_PATH, gsCode, 'utf8');
    console.log("  ✓ Updated AssetRegistry.gs successfully.");

    // 6. Generate MasterReferenceRegistrationReport.md
    console.log("\n📝 Generating MasterReferenceRegistrationReport.md...");
    let mReport = `# Master Reference Registration Report\n\n`;
    mReport += `* **Migration Date**: ${new Date().toLocaleString()}\n`;
    mReport += `* **Status**: 🟢 SUCCESS\n\n`;
    
    mReport += `## 1. Migrated Master Reference Files\n\n`;
    mReport += `| Master Type | File Name | Size (Bytes) | SHA-256 Hash | Google Drive File ID | Target Location |\n`;
    mReport += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    mReport += `| Postal Master | \`${postalMeta.fileName}\` | ${postalMeta.size} | \`${postalMeta.hash}\` | \`${postalFileId}\` | \`01_MASTER/Reference/Postal\` |\n`;
    mReport += `| Address Master | \`${addressMeta.fileName}\` | ${addressMeta.size} | \`${addressMeta.hash}\` | \`${addressFileId}\` | \`01_MASTER/Reference/Address\` |\n`;

    fs.writeFileSync(REPORT_PATH, mReport, 'utf8');
    console.log(`  ✓ Created MasterReferenceRegistrationReport.md at: ${REPORT_PATH}`);

    // 7. Update MigrationReport.md
    console.log("\n📝 Updating MigrationReport.md...");
    if (fs.existsSync(MAIN_REPORT_PATH)) {
      let mainReport = fs.readFileSync(MAIN_REPORT_PATH, 'utf8');
      
      const insertionIndex = mainReport.indexOf("## 3. Configured Asset Registry");
      if (insertionIndex !== -1) {
        let insertContent = `## 2.5. Master Reference Data Migration\n\n`;
        insertContent += `* **Postal Master**: \`${postalMeta.fileName}\` successfully uploaded (ID: \`${postalFileId}\`)\n`;
        insertContent += `* **Address Master**: \`${addressMeta.fileName}\` successfully uploaded (ID: \`${addressFileId}\`)\n\n`;
        
        mainReport = mainReport.substring(0, insertionIndex) + insertContent + mainReport.substring(insertionIndex);
        fs.writeFileSync(MAIN_REPORT_PATH, mainReport, 'utf8');
        console.log("  ✓ Appended Master Reference migration logs to MigrationReport.md.");
      }
    }

    console.log("\n==================================================");
    console.log("🎉 MASTER REFERENCE MIGRATION COMPLETED SUCCESSFULLY");
    console.log("==================================================\n");

  } catch (err) {
    console.error(`❌ Migration failed: ${err.message}`);
    process.exit(1);
  }
}

main();
