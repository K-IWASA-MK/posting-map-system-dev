/**
 * POSTING MAP
 * Phase 32: District Provisioning CLI Tool
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const RegistryManager = require('./registry-manager');
const OAuthChecker = require('./oauth-checker');
const { getClaspToken } = require('./cleanup-district');

// Parse Arguments
const args = process.argv.slice(2);
const districtIndex = args.indexOf('--district');
if (districtIndex === -1 || !args[districtIndex + 1]) {
  console.error("❌ Error: Please specify district ID using --district <ID> (e.g. MIE-04)");
  process.exit(1);
}
const districtId = args[districtIndex + 1];

// Constants
const TEMPLATE_SPREADSHEET_ID = "14rblnvJH5hkXHU9-9lhZlDaUi-FenuQQ5DWnTP7TbW4"; // MIE-03 Template
const PARENT_FOLDER_ID = "18SZgoZBw-lWMMvuWwlnah5tFM2RYgsnY"; // Storage Root

async function copyFile(fileId, newName, token) {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/copy`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: newName })
  });
  if (!res.ok) {
    throw new Error(`Failed to copy file ${fileId}: ${res.statusText}`);
  }
  const data = await res.json();
  return data.id;
}

async function createFolder(folderName, parentId, token) {
  const url = `https://www.googleapis.com/drive/v3/files`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    })
  });
  if (!res.ok) {
    throw new Error(`Failed to create folder: ${res.statusText}`);
  }
  const data = await res.json();
  return data.id;
}

function promptUser(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function main() {
  console.log(`==================================================`);
  console.log(`🚀 Starting District Provisioning Pipeline for: ${districtId}`);
  console.log(`==================================================\n`);

  try {
    const token = await getClaspToken();
    
    // Step 1: Initialize Manifest
    const manifest = RegistryManager.initialize(districtId, `${districtId} 支部`, "postingareamap@gmail.com");
    const scriptId = manifest.resources.scriptId || "158Avw8hAtZx-c9yW10DE0NzB1NYngwv31eroqn-IAmHh_eKHN_fR58sa";
    manifest.resources.scriptId = scriptId;

    // Step 2: GAS Deploy (初回準備)
    console.log(`[1/5] Deploying GAS Code...`);
    execSync(`clasp push`, { stdio: 'inherit' });
    
    console.log("Triggering clasp deploy...");
    const deployOutput = execSync(`clasp deploy -i AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R`, { encoding: 'utf8' });
    console.log(deployOutput);
    
    const webAppUrl = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";
    manifest.resources.webAppUrl = webAppUrl;
    RegistryManager.save(manifest);

    // Step 3: OAuth Verification Loop (Before calling internal provisioning APIs)
    console.log(`[2/5] Checking OAuth Authorization...`);
    let authCheck = await OAuthChecker.check(webAppUrl, 'valid-api-key');
    
    while (!authCheck.authorized) {
      console.log(`\n🚨 OAuth AUTHORIZATION REQUIRED`);
      console.log(`The Web App execution is currently blocked by Google's gateway.`);
      console.log(`Please follow these steps:`);
      console.log(`1. Open the Apps Script Editor: https://script.google.com/home/projects/${scriptId}/edit`);
      console.log(`2. Login under postingareamap@gmail.com`);
      console.log(`3. Select any function (e.g. verifyDistrictDeployment) and click '実行' (Run) to trigger the Authorization Dialog.`);
      console.log(`4. Click 'Allow' (許可) to grant the script access to Google Spreadsheets and Drive.`);
      
      await promptUser(`\nOnce you have completed authorization, press [ENTER] to retry: `);
      authCheck = await OAuthChecker.check(webAppUrl, 'valid-api-key');
    }
    console.log(`✓ OAuth Authorization Certified!`);

    // Step 4: Run Internal Provisioning (Copy Spreadsheet and Folder under Native GAS Scope)
    console.log(`[3/5] Creating and Bootstrapping Drive Resources on Remote Web App...`);
    const initUrl = `${webAppUrl}?action=verifyDeployment&apiKey=valid-api-key&provisionDistrict=true&districtId=${districtId}`;
    const initRes = await fetch(initUrl, { method: 'GET', redirect: 'follow' });
    const initText = await initRes.text();
    
    let initJson;
    try {
      initJson = JSON.parse(initText);
    } catch (e) {
      throw new Error(`Failed to parse provisioning response: ${initText}`);
    }
    
    if (!initJson.success || !initJson.data || !initJson.data.success) {
      throw new Error(`Provisioning failed: ${initJson.error ? initJson.error.message : (initJson.data ? initJson.data.message : 'Unknown error')}`);
    }
    
    const resources = initJson.data.resources;
    console.log(`✓ Remote Provisioning Succeeded!`);
    console.log(`  New Spreadsheet ID: ${resources.spreadsheetId}`);
    console.log(`  New Storage Folder ID: ${resources.storageFolderId}`);
    
    manifest.resources.spreadsheetId = resources.spreadsheetId;
    manifest.resources.storageFolderId = resources.storageFolderId;
    RegistryManager.save(manifest);

    // Run final Phase 31 validation
    console.log(`\n[4/5] Running Phase 31 Certification Validation...`);

    // Launch Phase 31 Verification
    console.log(`\n==================================================`);
    console.log(`📋 Running Phase 31 Certification Validation...`);
    console.log(`==================================================`);
    
    execSync(`node development/deploy-verify.js`, { stdio: 'inherit' });

    // Update status to READY
    manifest.provisioning.status = "READY";
    manifest.certification.phase31 = "PASS";
    RegistryManager.save(manifest);

    // Generate active/dashboard/clients/DISTRICT_ID/ config & manifest files
    console.log(`\n[5/5] Generating client configuration registry...`);
    const clientDir = path.join(__dirname, '..', 'active', 'dashboard', 'clients', districtId);
    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir, { recursive: true });
    }

    const clientConfig = {
      districtId: districtId,
      districtName: `${districtId} 支部`,
      environment: "production",
      api: {
        gasWebAppUrl: webAppUrl
      },
      line: {
        liffId: "2010177345-tXZIMAJK"
      },
      features: {
        photoUpload: true,
        gpsTracking: true
      }
    };

    fs.writeFileSync(
      path.join(clientDir, 'config.js'),
      `/**\n * Auto-generated Client Config\n */\nwindow.PMS_CLIENT_CONFIG = ${JSON.stringify(clientConfig, null, 2)};\n`,
      'utf8'
    );

    fs.writeFileSync(
      path.join(clientDir, 'deployment.json'),
      JSON.stringify(manifest, null, 2),
      'utf8'
    );
    console.log(`✓ Client registry folder created: active/dashboard/clients/${districtId}/`);

    console.log(`\n🎉 PROVISIONING SUCCESSFUL: District ${districtId} is certified and active.`);
  } catch (err) {
    console.error(`\n❌ Provisioning failed: ${err.toString()}`);
    console.log(`\nInitiating rollback sequence...`);
    execSync(`node development/cleanup-district.js`, { stdio: 'inherit' });
    process.exit(1);
  }
}

main();
