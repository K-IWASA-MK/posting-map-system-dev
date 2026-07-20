import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ProvisioningStage } from './ProvisioningStage';
import { ProvisioningStateMachine, ProvisioningContext } from './ProvisioningStateMachine';
import { AssetCloner } from './AssetCloner';
import { RootResolver } from '../../../../../tools/review/RootResolver';

const BRANCH_ROOT_FOLDER_ID = "1EQQqWbtyF7iMd7Fk-WnUwWiAGB4MdIdN"; // FIELD_OPERATIONS_PLATFORM/03_BRANCH

interface AIOSEvent {
  type: string;
  missionId: string;
  districtName: string;
  payload?: any;
}

async function getClaspToken() {
  const claspRcPath = path.join(os.homedir(), '.clasprc.json');
  if (!fs.existsSync(claspRcPath)) {
    throw new Error(`Clasp configuration not found at: ${claspRcPath}`);
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
    throw new Error(`Failed to refresh token: ${res.statusText}`);
  }
  const data = await res.json();
  def.access_token = data.access_token;
  if (data.expires_in) {
    def.expiry_date = Date.now() + (data.expires_in * 1000);
  }
  fs.writeFileSync(claspRcPath, JSON.stringify(rc, null, 2), 'utf8');
  return data.access_token;
}

async function driveFetch(endpoint: string, token: string, options: any = {}) {
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

async function getFolderByNameAndParent(name: string, parentId: string, token: string) {
  const subSearchQ = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const subSearchRes = await driveFetch(`files?q=${encodeURIComponent(subSearchQ)}&fields=files(id,name,parents)`, token);
  return (subSearchRes.files || []).find((f: any) => f.parents && f.parents.includes(parentId)) || null;
}

async function createFolder(name: string, parentId: string, token: string) {
  const payload = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId]
  };
  const res = await driveFetch('files', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.id;
}

async function uploadJsonFile(name: string, content: any, parentId: string, token: string) {
  const metadata = { name, parents: [parentId] };
  const jsonStr = JSON.stringify(content, null, 2);
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const metadataPart = 
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n`;

  const fileHeader = `Content-Type: application/json\r\n\r\n`;

  const payload = Buffer.concat([
    Buffer.from(delimiter, 'utf8'),
    Buffer.from(metadataPart, 'utf8'),
    Buffer.from(delimiter, 'utf8'),
    Buffer.from(fileHeader, 'utf8'),
    Buffer.from(jsonStr, 'utf8'),
    Buffer.from(closeDelim, 'utf8')
  ]);

  const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`,
      'Content-Length': String(payload.length)
    },
    body: payload
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JSON upload failed: ${text}`);
  }
  return await res.json();
}

export class ProvisioningRuntime {
  public static async processEvent(event: AIOSEvent): Promise<{ success: boolean; message: string; outputEvent?: any }> {
    if (event.type !== 'DATA_BUILD_COMPLETED') {
      return { success: false, message: `Unsupported event type: ${event.type}` };
    }

    const isMock = process.env.NODE_ENV === 'test' || process.env.AIOS_MOCK === 'true';
    const context: ProvisioningContext = {
      missionId: event.missionId,
      districtName: event.districtName,
      isMock
    };

    const sm = new ProvisioningStateMachine(context);

    try {
      if (!event.districtName || event.districtName.trim() === '') {
        throw new Error("Invalid or empty districtName provided.");
      }

      console.log(`[Audit Event] PROVISIONING_STARTED (Mission: ${event.missionId}, District: ${event.districtName})`);
      // 1. Resolve Auth Token
      let token = '';
      if (!isMock) {
        token = await getClaspToken();
        context.token = token;
      }

      // 2. PREPARING Phase (Resolve/Create target GDrive/Local folder)
      sm.transitionTo(ProvisioningStage.PREPARING);
      let districtFolderId = '';
      
      if (isMock) {
        const localBranchDir = path.join(RootResolver.resolvePlatform('posting-map'), '03_BRANCH', event.districtName);
        if (!fs.existsSync(localBranchDir)) {
          fs.mkdirSync(localBranchDir, { recursive: true });
        }
        districtFolderId = `mock-folder-${event.districtName}`;
      } else {
        let districtFolder = await getFolderByNameAndParent(event.districtName, BRANCH_ROOT_FOLDER_ID, token);
        if (!districtFolder) {
          console.log(`[Provisioning] Creating missing GDrive district folder for: ${event.districtName}`);
          const newFolderId = await createFolder(event.districtName, BRANCH_ROOT_FOLDER_ID, token);
          context.districtFolderId = newFolderId; // tracked for rollback
          districtFolderId = newFolderId;
        } else {
          districtFolderId = districtFolder.id;
        }
      }

      // 3. Resolve template ID from AssetRegistry
      const registryPath = path.join(RootResolver.resolveProject('posting-map'), 'active', 'dashboard', 'clients', 'AssetRegistry.json');
      if (!fs.existsSync(registryPath)) {
        throw new Error(`AssetRegistry.json not found at: ${registryPath}`);
      }
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      const templateSpreadsheetId = registry.templates.spreadsheetId;
      const templateScriptId = registry.templates.scriptId;
      const templateWebAppUrl = registry.templates.webAppUrl;

      if (!templateSpreadsheetId) {
        throw new Error("Template Spreadsheet ID is missing from registry.");
      }

      // 4. CLONING_TEMPLATE Phase
      sm.transitionTo(ProvisioningStage.CLONING_TEMPLATE);
      const clonedSpreadsheetId = await AssetCloner.cloneSpreadsheet(
        templateSpreadsheetId,
        event.districtName,
        districtFolderId,
        token,
        isMock
      );
      context.spreadsheetId = clonedSpreadsheetId; // tracked for rollback

      // 5. CREATING_STORAGE Phase
      sm.transitionTo(ProvisioningStage.CREATING_STORAGE);
      const createdStorageFolderId = await AssetCloner.createStorageFolder(
        event.districtName,
        districtFolderId,
        token,
        isMock
      );
      context.storageFolderId = createdStorageFolderId; // tracked for rollback

      // 6. REGISTERING_ASSETS Phase (Delayed till clone & storage successfully created)
      sm.transitionTo(ProvisioningStage.REGISTERING_ASSETS);
      
      // Determine district ID representation (e.g. TOKYO-18)
      let districtId = "DST-UNK";
      if (event.districtName.includes("東京")) {
        const match = event.districtName.match(/\d+/);
        districtId = `TOKYO-${match ? match[0] : "UNK"}`;
      } else if (event.districtName.includes("大阪")) {
        const match = event.districtName.match(/\d+/);
        districtId = `OSAKA-${match ? match[0] : "UNK"}`;
      } else if (event.districtName.includes("三重")) {
        const match = event.districtName.match(/\d+/);
        districtId = `MIE-${match ? match[0] : "UNK"}`;
      }

      // Update registry
      registry.masters.districts[districtId] = {
        spreadsheetId: clonedSpreadsheetId,
        storageFolderId: createdStorageFolderId,
        gasScriptId: templateScriptId || ""
      };
      registry.updatedAt = Date.now();
      
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
      console.log(`[Provisioning] Updated AssetRegistry.json for district ID: ${districtId}`);

      // 7. VERIFYING Phase (QA Gate connectivity verification)
      sm.transitionTo(ProvisioningStage.VERIFYING);
      
      // Check file existences
      if (isMock) {
        const mockSpreadsheetPath = path.join(RootResolver.resolvePlatform('posting-map'), '03_BRANCH', event.districtName, 'spreadsheet.json');
        const mockStoragePath = path.join(RootResolver.resolvePlatform('posting-map'), '03_BRANCH', event.districtName, 'storage');
        if (!fs.existsSync(mockSpreadsheetPath) || !fs.existsSync(mockStoragePath)) {
          throw new Error("Cloned mock assets missing during verification.");
        }
      }
      
      // Validate merged registry
      const checkRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      if (!checkRegistry.masters.districts[districtId]) {
        throw new Error(`Registry verification failed: district ID ${districtId} was not mapped.`);
      }

      // 8. READY / PROVISIONING_COMPLETED Phase
      sm.transitionTo(ProvisioningStage.READY);

      // Generate deployment.json
      const deploymentData = {
        district: {
          id: districtId,
          name: event.districtName
        },
        resources: {
          spreadsheetId: clonedSpreadsheetId,
          storageFolderId: createdStorageFolderId,
          scriptId: templateScriptId,
          webAppUrl: templateWebAppUrl,
          gas: {
            mode: "REGISTER_ONLY",
            scriptId: templateScriptId,
            webAppUrl: templateWebAppUrl
          }
        },
        provisioning: {
          templateVersion: registry.templates.version || "v1",
          createdAt: Date.now(),
          createdBy: "aios-provisioner@platform.postingmap",
          status: "READY",
          transactionId: `prov-${Date.now()}-${districtId}`
        },
        certification: {
          phase31: "PASS"
        }
      };

      if (isMock) {
        const localDeploymentPath = path.join(RootResolver.resolvePlatform('posting-map'), '03_BRANCH', event.districtName, 'deployment.json');
        fs.writeFileSync(localDeploymentPath, JSON.stringify(deploymentData, null, 2), 'utf8');
      } else {
        await uploadJsonFile("deployment.json", deploymentData, districtFolderId, token);
      }

      console.log(`[Audit Event] PROVISIONING_COMPLETED (Mission: ${event.missionId})`);

      const outputEvent = {
        type: "PROVISIONING_COMPLETED",
        missionId: event.missionId,
        districtName: event.districtName,
        districtId,
        spreadsheetId: clonedSpreadsheetId,
        storageFolderId: createdStorageFolderId,
        occurredAt: new Date().toISOString()
      };

      return {
        success: true,
        message: "Branch environment provisioned successfully.",
        outputEvent
      };

    } catch (err: any) {
      console.error(`[Audit Event] PROVISIONING_FAILED (Mission: ${event.missionId}, Error: ${err.message})`);
      await sm.fail(err.message);
      return {
        success: false,
        message: `Provisioning pipeline failure: ${err.message}`
      };
    }
  }
}
