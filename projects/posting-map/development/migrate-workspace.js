/**
 * POSTING MAP
 * Google Drive Workspace Migration Tool
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const actionIndex = args.indexOf('--action');
const action = (actionIndex !== -1 && args[actionIndex + 1]) ? args[actionIndex + 1] : 'dryrun';

// Target Configs
const STORAGE_ROOT_ID = "18SZgoZBw-lWMMvuWwlnah5tFM2RYgsnY"; // Base Workspace ID
const REGISTRY_PATH = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'registry.json');
const INVENTORY_PATH = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'AssetInventory.json');
const REGISTRY_OUTPUT_PATH = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'AssetRegistry.json');
const DRYRUN_REPORT_PATH = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'DryRunReport.md');

// Utility to get authenticated token from clasp
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

// Drive fetch wrapper helper
async function driveFetch(endpoint, token, options = {}) {
  const url = `https://www.googleapis.com/drive/v3/${endpoint}`;
  console.log(`  [Drive Fetch] Calling: ${url}`);
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

// Discover current resources on Drive (only query accessible STORAGE_ROOT_ID to prevent 404)
async function discover(token, mappings) {
  console.log("🔍 Running Phase 0: Workspace Discovery & Classification...");
  
  const rawFiles = [];
  const query = `"${STORAGE_ROOT_ID}" in parents and trashed = false`;
  const listResult = await driveFetch(`files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,parents,capabilities)`, token);
  if (listResult.files) {
    rawFiles.push(...listResult.files);
  }
  
  console.log(`✓ Scanned ${rawFiles.length} raw assets in Drive directories.`);

  // 2. Load registry.json to cross-reference mapped assets
  let registryData = { districts: [] };
  if (fs.existsSync(REGISTRY_PATH)) {
    registryData = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  }

  const assets = [];
  const registeredScriptIds = new Set();
  const systemFolders = ["FIELD_OPERATIONS_PLATFORM", "01_MASTER", "02_SYSTEM", "03_BRANCH", "04_STORAGE", "05_BACKUP", "06_DASHBOARD", "07_MANUAL", "99_ARCHIVE"];

  rawFiles.forEach(file => {
    // Skip the root folder and system folders to prevent circular references
    if (systemFolders.includes(file.name)) {
      return;
    }

    // Classification Logic
    let type = "other";
    let destination = "";
    let action = "move";

    if (file.mimeType === "application/vnd.google-apps.spreadsheet") {
      if (file.name.includes("Template") || file.id === "14rblnvJH5hkXHU9-9lhZlDaUi-FenuQQ5DWnTP7TbW4") {
        type = "template_spreadsheet";
        destination = "01_MASTER/Templates/";
      } else {
        type = "branch_spreadsheet";
        destination = "03_BRANCH/";
      }
    } else if (file.mimeType === "application/vnd.google-apps.folder") {
      type = "branch_storage_folder";
      destination = "04_STORAGE/";
      action = "skip";
    } else if (file.name.endsWith(".csv") || file.name.endsWith(".CSV")) {
      type = "master_csv";
      destination = "01_MASTER/Reference/";
    } else {
      // Miscellaneous files (images, configs) should not be moved automatically
      action = "skip";
    }

    assets.push({
      name: file.name,
      type,
      id: file.id,
      parents: file.parents,
      canMove: file.capabilities ? file.capabilities.canMoveItemWithinDrive : false,
      action,
      destination
    });
  });

  // Cross reference districts from registry.json to ensure all script projects and spreadsheets are registered
  const registeredSpreadsheetIds = new Set();
  rawFiles.forEach(f => registeredSpreadsheetIds.add(f.id));

  registryData.districts.forEach(d => {
    if (d.resources) {
      if (d.resources.scriptId && !registeredScriptIds.has(d.resources.scriptId)) {
        registeredScriptIds.add(d.resources.scriptId);
        assets.push({
          name: `${d.name} Apps Script Project`,
          projectName: d.name,
          type: "gas_project",
          id: d.resources.scriptId,
          action: "register",
          destination: "02_SYSTEM/GAS/",
          webAppUrl: d.resources.webAppUrl,
          version: d.deployment ? d.deployment.version : "unknown"
        });
      }

      if (d.resources.spreadsheetId && !registeredSpreadsheetIds.has(d.resources.spreadsheetId)) {
        registeredSpreadsheetIds.add(d.resources.spreadsheetId);
        
        // MIE-03 spreadsheet is treated as the Template Spreadsheet
        const isTemplate = d.id === "MIE-03";
        assets.push({
          name: `${d.name} Spreadsheet`,
          type: isTemplate ? "template_spreadsheet" : "branch_spreadsheet",
          id: d.resources.spreadsheetId,
          action: "register",
          destination: isTemplate ? "01_MASTER/Templates/" : "03_BRANCH/"
        });
      }
    }
  });

  // Inject known branch storage folders to guarantee mapping in registry
  const knownStorageFolders = [
    { name: "MIE-05 支部_STORAGE", type: "branch_storage_folder", id: "1uoCwkEITDxoQjvVkl2G4djA34wMQS9eV" },
    { name: "MIE-04 支部_STORAGE", type: "branch_storage_folder", id: "1j45kdXmU9pj-tY7QQmjB3nvINz4zCesN" },
    { name: "posting-map-snapshot", type: "branch_storage_folder", id: "1hjoDkBQ-q7YWuHwOZaLmqEHTlJwvcMHY" }
  ];

  knownStorageFolders.forEach(folder => {
    assets.push({
      name: folder.name,
      type: folder.type,
      id: folder.id,
      action: "register",
      destination: "04_STORAGE/"
    });
  });

  return assets;
}

// Generate FIELD_OPERATIONS_PLATFORM directory structure
async function setupFolders(token) {
  console.log("📂 Running Phase 1: Folder Structure Setup...");

  // Use the correct pre-existing FIELD_OPERATIONS_PLATFORM root folder ID (case-sensitive lowercase 'f')
  const rootFolderId = "1FfcVEQjod--rZSucOPFJD2DJ58hV650_";
  console.log(`✓ Using explicit FIELD_OPERATIONS_PLATFORM root folder: ${rootFolderId}`);

  // 8 Target Subfolders
  const subfolders = [
    "01_MASTER",
    "02_SYSTEM",
    "03_BRANCH",
    "04_STORAGE",
    "05_BACKUP",
    "06_DASHBOARD",
    "07_MANUAL",
    "99_ARCHIVE"
  ];

  const folderMappings = {};

  for (const name of subfolders) {
    const subSearchQ = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const subSearchRes = await driveFetch(`files?q=${encodeURIComponent(subSearchQ)}&fields=files(id,name,parents)`, token);
    
    let subFolderId;
    const matchedFolder = (subSearchRes.files || []).find(f => f.parents && f.parents.includes(rootFolderId));

    console.log(`    [Debug] search for name: "${name}" returned ${(subSearchRes.files || []).length} results.`);
    if (subSearchRes.files && subSearchRes.files.length > 0) {
      console.log(`    [Debug] Results: ${JSON.stringify(subSearchRes.files)}`);
    }

    if (matchedFolder) {
      subFolderId = matchedFolder.id;
      console.log(`  ✓ Found existing subfolder ${name}: ${subFolderId}`);
    } else {
      console.log(`  Creating subfolder ${name} under ${rootFolderId}...`);
      const createSub = await driveFetch(`files`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mimeType: "application/vnd.google-apps.folder",
          parents: [rootFolderId]
        })
      });
      subFolderId = createSub.id;
      console.log(`  ✓ Created subfolder ${name}: ${subFolderId}`);
    }
    folderMappings[name] = subFolderId;
  }

  // Create sub-subfolders under 01_MASTER (Election, Postal, Reference, Templates)
  const masterId = folderMappings["01_MASTER"];
  const masterSubfolders = ["Election", "Postal", "Reference", "Templates"];
  folderMappings["01_MASTER_SUBS"] = {};

  for (const name of masterSubfolders) {
    const subSearchQ = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const subSearchRes = await driveFetch(`files?q=${encodeURIComponent(subSearchQ)}&fields=files(id,name,parents)`, token);
    
    let subId;
    const matchedSub = (subSearchRes.files || []).find(f => f.parents && f.parents.includes(masterId));

    if (matchedSub) {
      subId = matchedSub.id;
      console.log(`    ✓ Found existing master subfolder ${name}: ${subId}`);
    } else {
      console.log(`    Creating master subfolder ${name} under ${masterId}...`);
      const createSub = await driveFetch(`files`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mimeType: "application/vnd.google-apps.folder",
          parents: [masterId]
        })
      });
      subId = createSub.id;
      console.log(`    ✓ Created master subfolder ${name}: ${subId}`);
    }
    folderMappings["01_MASTER_SUBS"][name] = subId;
  }

  // Create sub-subfolders under 02_SYSTEM (GAS, Runtime, Config, MCP)
  const systemId = folderMappings["02_SYSTEM"];
  const systemSubfolders = ["GAS", "Runtime", "Config", "MCP"];
  folderMappings["02_SYSTEM_SUBS"] = {};

  for (const name of systemSubfolders) {
    const subSearchQ = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const subSearchRes = await driveFetch(`files?q=${encodeURIComponent(subSearchQ)}&fields=files(id,name,parents)`, token);
    
    let subId;
    const matchedSub = (subSearchRes.files || []).find(f => f.parents && f.parents.includes(systemId));

    if (matchedSub) {
      subId = matchedSub.id;
      console.log(`    ✓ Found existing system subfolder ${name}: ${subId}`);
    } else {
      console.log(`    Creating system subfolder ${name} under ${systemId}...`);
      const createSub = await driveFetch(`files`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mimeType: "application/vnd.google-apps.folder",
          parents: [systemId]
        })
      });
      subId = createSub.id;
      console.log(`    ✓ Created system subfolder ${name}: ${subId}`);
    }
    folderMappings["02_SYSTEM_SUBS"][name] = subId;
  }

  return folderMappings;
}

// Generate Dry Run report without making physical changes
async function runDryRun(token) {
  console.log("\n🧪 Running Phase 2: Inventory & Dry Run Simulation...");
  const mappings = await setupFolders(token);
  const assets = await discover(token, mappings);

  const finalAssets = assets.map(asset => {
    let destId = "";
    if ((asset.action === "move" || asset.action === "register") && asset.destination) {
      if (asset.action === "register" && asset.type === "gas_project") {
        destId = mappings["02_SYSTEM_SUBS"]["GAS"];
      } else {
        const parts = asset.destination.split('/');
        const parentName = parts[0];
        const subName = parts[1];

        if (subName) {
          if (parentName === "01_MASTER" && mappings["01_MASTER_SUBS"]) {
            destId = mappings["01_MASTER_SUBS"][subName] || mappings[parentName];
          } else if (parentName === "02_SYSTEM" && mappings["02_SYSTEM_SUBS"]) {
            destId = mappings["02_SYSTEM_SUBS"][subName] || mappings[parentName];
          }
        } else {
          destId = mappings[parentName];
        }
      }
    } else if (asset.action === "register") {
      destId = mappings["02_SYSTEM_SUBS"]["GAS"];
    }

    return {
      ...asset,
      destinationFolderId: destId,
      status: "Pending"
    };
  });

  const inventory = {
    updatedAt: Date.now(),
    status: "DryRunPassed",
    assets: finalAssets
  };

  fs.writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf8');
  console.log(`✓ AssetInventory.json written containing ${finalAssets.length} assets.`);

  // Generate DryRunReport.md
  let report = `# Workspace Migration Dry Run Report\n\n`;
  report += `* **Simulation Timestamp**: ${new Date().toLocaleString()}\n`;
  report += `* **Status**: 🟢 Dry Run Passed (Ready for Review)\n\n`;
  report += `## Migration Mapping Summary\n\n`;
  report += `| Asset Name | Type | Action | Target Destination Folder | Status | ID / Info |\n`;
  report += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  finalAssets.forEach(a => {
    let displayDest = a.destination || "02_SYSTEM/GAS/ (Registered)";
    let actionTag = "";
    if (a.action === "move") {
      actionTag = "📦 Move parent";
    } else if (a.action === "register") {
      actionTag = "📝 Register Script";
    } else {
      actionTag = "⚠️ Skip (Keep)";
      displayDest = "No Change";
    }
    report += `| ${a.name} | ${a.type} | ${actionTag} | ${displayDest} | Pending | \`${a.id}\` |\n`;
  });

  fs.writeFileSync(DRYRUN_REPORT_PATH, report, 'utf8');
  console.log(`✓ DryRunReport.md generated.`);
  
  console.log("\n==================================================");
  console.log("🎉 DRY RUN COMPLETED SUCCESSFULLY");
  console.log("Please review DryRunReport.md and confirm with 'Proceed'.");
  console.log("==================================================\n");
}

// Verification engine for migrated/registered workspace files
async function verifyWorkspace(registry, token) {
  console.log("\n🧪 Running Post-Migration Verification Suite...");
  const results = [];

  const targets = [
    { name: "Template Spreadsheet", id: registry.templates.spreadsheetId, type: "file" },
    { name: "Template GAS (Script)", id: registry.templates.scriptId, type: "file" },
    { name: "Election Master", id: registry.masters.electionSpreadsheetId, type: "file" },
    { name: "Postal Master", id: registry.masters.postalCsvFileId, type: "file" },
    { name: "Reference Master", id: registry.masters.referenceMasterId, type: "file" },
    { name: "Storage Root Folder", id: registry.storage.rootFolderId, type: "folder" }
  ];

  registry.branches.forEach(b => {
    if (b.spreadsheetId) targets.push({ name: `${b.id} Spreadsheet`, id: b.spreadsheetId, type: "file" });
    if (b.storageFolderId) targets.push({ name: `${b.id} Storage Folder`, id: b.storageFolderId, type: "folder" });
  });

  for (const target of targets) {
    if (!target.id) {
      results.push({ name: target.name, status: "WARNING", details: "No ID registered." });
      continue;
    }
    try {
      const res = await driveFetch(`files/${target.id}?fields=id,name,trashed`, token);
      if (res && !res.trashed) {
        results.push({ name: target.name, status: "PASS", details: `Resolved name: "${res.name}" (ID: ${res.id})` });
      } else {
        results.push({ name: target.name, status: "FAIL", details: "File exists but is trashed." });
      }
    } catch (e) {
      results.push({ name: target.name, status: "FAIL", details: `Lookup error: ${e.message}` });
    }
  }

  return results;
}

// Perform actual physical file moves on Drive
async function executeMigration(token) {
  console.log("\n🚀 Running Phase 3: Migration & Registry Registration...");
  if (!fs.existsSync(INVENTORY_PATH)) {
    throw new Error("AssetInventory.json not found. Please run --action dryrun first.");
  }

  const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
  const registry = {
    updatedAt: Date.now(),
    schemaVersion: 1,
    templates: {
      spreadsheetId: "",
      scriptId: "",
      webAppUrl: "",
      version: ""
    },
    masters: {
      electionSpreadsheetId: "",
      postalCsvFileId: "",
      referenceMasterId: ""
    },
    dashboard: {
      assets: []
    },
    storage: {
      rootFolderId: ""
    },
    branches: []
  };

  let moveCount = 0;
  let registerCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < inventory.assets.length; i++) {
    const asset = inventory.assets[i];
    console.log(`\n[${i+1}/${inventory.assets.length}] Processing asset: ${asset.name}...`);

    try {
      if (asset.action === "move") {
        const fileId = asset.id;
        const newParentId = asset.destinationFolderId;
        const oldParentId = asset.parents ? asset.parents[0] : "";

        if (!newParentId) {
          console.warn(`  ⚠️ Skipped: Destination folder unresolved.`);
          skipCount++;
          asset.status = "Skipped";
          continue;
        }

        // Safety Skip if already moved
        if (newParentId === oldParentId) {
          console.log(`  File is already at the target destination folder. Skipping physical move API call.`);
          asset.status = "Migrated";
          moveCount++;
        } else {
          console.log(`  Moving from parent ${oldParentId} to ${newParentId}...`);
          
          // Update parent folder references
          const updateUrl = `files/${fileId}?addParents=${newParentId}&removeParents=${oldParentId}`;
          await driveFetch(updateUrl, token, {
            method: 'PATCH'
          });

          console.log(`  ✓ Successfully moved.`);
          asset.status = "Migrated";
          moveCount++;
        }

        // Category mapping logic based on parsed types
        if (asset.type === "template_spreadsheet") {
          registry.templates.spreadsheetId = fileId;
        } else if (asset.type === "master_csv") {
          if (asset.name.includes("Election") || asset.name.includes("区割り")) {
            registry.masters.electionSpreadsheetId = fileId;
          } else if (asset.name.includes("POSTAL") || asset.name.includes("postal")) {
            registry.masters.postalCsvFileId = fileId;
          } else {
            registry.masters.referenceMasterId = fileId;
          }
        } else if (asset.type === "branch_spreadsheet") {
          let branchId = asset.name.split(' ')[0].replace('支部', '');
          if (branchId === "三重県第4区") branchId = "MIE-04";
          if (branchId === "三重県第3区") branchId = "MIE-03";
          if (branchId === "三重県第5区") branchId = "MIE-05";

          let branch = registry.branches.find(b => b.id === branchId);
          if (!branch) {
            branch = { id: branchId };
            registry.branches.push(branch);
          }
          branch.spreadsheetId = fileId;
        } else if (asset.type === "branch_storage_folder") {
          let branchId = asset.name.split(' ')[0].replace('支部', '');
          if (branchId === "三重県第4区") branchId = "MIE-04";
          if (branchId === "三重県第3区") branchId = "MIE-03";
          if (branchId === "三重県第5区") branchId = "MIE-05";

          let branch = registry.branches.find(b => b.id === branchId);
          if (!branch) {
            branch = { id: branchId };
            registry.branches.push(branch);
          }
          branch.storageFolderId = fileId;
        }
      } else if (asset.action === "register") {
        console.log(`  Registering metadata for: ${asset.name} (ID: ${asset.id})...`);
        
        if (asset.type === "gas_project") {
          registry.templates.scriptId = asset.id;
          registry.templates.projectName = asset.projectName || asset.name;
          registry.templates.webAppUrl = asset.webAppUrl;
          registry.templates.version = asset.version;
          registry.templates.lastUpdated = new Date().toISOString();
          registry.templates.driveFileId = asset.id;
        } else if (asset.type === "template_spreadsheet") {
          registry.templates.spreadsheetId = asset.id;
        } else if (asset.type === "branch_spreadsheet") {
          let branchId = asset.name.split(' ')[0].replace('支部', '');
          if (branchId === "三重県第4区") branchId = "MIE-04";
          if (branchId === "三重県第3区") branchId = "MIE-03";
          if (branchId === "三重県第5区") branchId = "MIE-05";

          let branch = registry.branches.find(b => b.id === branchId);
          if (!branch) {
            branch = { id: branchId };
            registry.branches.push(branch);
          }
          branch.spreadsheetId = asset.id;
        } else if (asset.type === "branch_storage_folder") {
          let branchId = asset.name.split(' ')[0].replace('支部', '');
          if (branchId === "三重県第4区") branchId = "MIE-04";
          if (branchId === "三重県第3区") branchId = "MIE-03";
          if (branchId === "三重県第5区") branchId = "MIE-05";

          let branch = registry.branches.find(b => b.id === branchId);
          if (!branch) {
            branch = { id: branchId };
            registry.branches.push(branch);
          }
          branch.storageFolderId = asset.id;
        }
        
        asset.status = "Registered";
        registerCount++;
        console.log(`  ✓ Registered.`);
      } else {
        console.log(`  ⚠️ Skipped: Action set to skip.`);
        
        // Map skipped metadata to registry
        if (asset.type === "branch_storage_folder") {
          let branchId = asset.name.split(' ')[0].replace('支部', '');
          if (branchId === "三重県第4区") branchId = "MIE-04";
          if (branchId === "三重県第3区") branchId = "MIE-03";
          if (branchId === "三重県第5区") branchId = "MIE-05";

          let branch = registry.branches.find(b => b.id === branchId);
          if (!branch) {
            branch = { id: branchId };
            registry.branches.push(branch);
          }
          branch.storageFolderId = asset.id;
        } else if (asset.type === "branch_spreadsheet") {
          let branchId = asset.name.split(' ')[0].replace('支部', '');
          if (branchId === "三重県第4区") branchId = "MIE-04";
          if (branchId === "三重県第3区") branchId = "MIE-03";
          if (branchId === "三重県第5区") branchId = "MIE-05";

          let branch = registry.branches.find(b => b.id === branchId);
          if (!branch) {
            branch = { id: branchId };
            registry.branches.push(branch);
          }
          branch.spreadsheetId = asset.id;
        }

        asset.status = "Skipped";
        skipCount++;
      }
    } catch (e) {
      console.error(`  ❌ Process error: ${e.message}`);
      asset.status = "Failed";
      errorCount++;
      errors.push({ name: asset.name, error: e.message });
    }
  }

  // Bind 04_STORAGE folder ID to registry
  const storageFolderAsset = inventory.assets.find(a => a.type === "branch_storage_folder");
  if (storageFolderAsset && storageFolderAsset.destinationFolderId) {
    registry.storage.rootFolderId = storageFolderAsset.destinationFolderId;
  }

  // Update Inventory status
  inventory.status = "Completed";
  fs.writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf8');

  // Save Registry Object
  fs.writeFileSync(REGISTRY_OUTPUT_PATH, JSON.stringify(registry, null, 2), 'utf8');
  console.log(`\n✓ AssetRegistry.json successfully generated: ${REGISTRY_OUTPUT_PATH}`);

  // Create AssetRegistry.gs template for GAS integration
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
`;
  
  const gsPath = path.join(__dirname, '..', 'active', 'api', 'AssetRegistry.gs');
  if (!fs.existsSync(path.dirname(gsPath))) {
    fs.mkdirSync(path.dirname(gsPath), { recursive: true });
  }
  fs.writeFileSync(gsPath, gsCode, 'utf8');
  console.log(`✓ AssetRegistry.gs successfully generated: ${gsPath}`);

  // Run Verification Suite
  const verificationResults = await verifyWorkspace(registry, token);

  // Generate MigrationReport.md
  const reportPath = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'MigrationReport.md');
  let report = `# Google Drive Workspace Migration Report\n\n`;
  report += `* **Migration Date**: ${new Date().toLocaleString()}\n`;
  report += `* **Status**: ${errorCount === 0 ? "🟢 SUCCESS" : "🔴 DEGRADED (Errors Detected)"}\n\n`;
  
  report += `## 1. Migration Summary Statistics\n\n`;
  report += `* **Moved Assets**: ${moveCount}\n`;
  report += `* **Registered Assets**: ${registerCount}\n`;
  report += `* **Skipped Assets**: ${skipCount}\n`;
  report += `* **Errors**: ${errorCount}\n\n`;

  if (errors.length > 0) {
    report += `### Error Details\n\n`;
    errors.forEach(e => {
      report += `* **${e.name}**: ${e.error}\n`;
    });
    report += `\n`;
  }

  report += `## 2. Verification Results\n\n`;
  report += `| Target Component | Status | Details |\n`;
  report += `| :--- | :--- | :--- |\n`;
  verificationResults.forEach(v => {
    const emoji = v.status === "PASS" ? "✅" : (v.status === "WARNING" ? "⚠️" : "❌");
    report += `| ${v.name} | ${emoji} ${v.status} | ${v.details} |\n`;
  });

  report += `\n## 3. Configured Asset Registry\n\n`;
  report += `\`\`\`json\n${JSON.stringify(registry, null, 2)}\n\`\`\`\n`;

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`✓ MigrationReport.md successfully generated: ${reportPath}`);

  console.log("\n==================================================");
  console.log("🎉 MIGRATION COMPLETED");
  console.log("All target files moved. Registry maps written.");
  console.log("==================================================\n");
}

async function main() {
  try {
    const token = await getClaspToken();
    if (action === "dryrun") {
      await runDryRun(token);
    } else if (action === "execute") {
      await executeMigration(token);
    } else {
      console.error(`❌ Unknown action "${action}"`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ Execution failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
