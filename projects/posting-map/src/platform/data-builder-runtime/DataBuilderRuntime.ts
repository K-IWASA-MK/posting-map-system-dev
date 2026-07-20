import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DistrictMetadataHelper } from './DistrictMetadata';
import { BranchConfigHelper } from './BranchConfig';
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

async function getFileByNameAndParent(name: string, parentId: string, token: string) {
  const fileSearchQ = `name = '${name}' and trashed = false`;
  const fileSearchRes = await driveFetch(`files?q=${encodeURIComponent(fileSearchQ)}&fields=files(id,name,parents)`, token);
  return (fileSearchRes.files || []).find((f: any) => f.parents && f.parents.includes(parentId)) || null;
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

export class DataBuilderRuntime {
  public static async processEvent(event: AIOSEvent): Promise<{ success: boolean; message: string; outputEvent?: any }> {
    if (event.type !== 'RESEARCH_COMPLETED') {
      return { success: false, message: `Unsupported event type: ${event.type}` };
    }

    console.log(`[Audit Event] DATA_BUILDER_STARTED (Mission: ${event.missionId}, District: ${event.districtName})`);

    try {
      // 1. Read input research-result.json
      let inputData: any;
      
      if (process.env.NODE_ENV === 'test' || process.env.AIOS_MOCK === 'true') {
        const localResultPath = path.join(RootResolver.resolvePlatform('posting-map'), '03_BRANCH', event.districtName, 'research-result.json');
        if (!fs.existsSync(localResultPath)) {
          throw new Error(`Local research-result.json not found for ${event.districtName} at: ${localResultPath}`);
        }
        inputData = JSON.parse(fs.readFileSync(localResultPath, 'utf8'));
      } else {
        // GDrive fetch
        const token = await getClaspToken();
        const districtFolder = await getFolderByNameAndParent(event.districtName, BRANCH_ROOT_FOLDER_ID, token);
        if (!districtFolder) {
          throw new Error(`District folder not found in Drive: ${event.districtName}`);
        }
        const researchFile = await getFileByNameAndParent("research-result.json", districtFolder.id, token);
        if (!researchFile) {
          throw new Error(`research-result.json not found in Drive folder for ${event.districtName}`);
        }
        // Fetch content
        const fileRes = await driveFetch(`files/${researchFile.id}?alt=media`, token);
        inputData = fileRes;
      }

      const municipalities = inputData.municipalities || [];
      if (!Array.isArray(municipalities)) {
        throw new Error("Invalid municipalities format in research result.");
      }

      // 2. Generate structured configurations conforming to contracts
      const districtMetadata = DistrictMetadataHelper.create(event.districtName, municipalities);
      const branchConfig = BranchConfigHelper.createDefault();

      // 3. Save artifacts (Drive vs Local Mock)
      if (process.env.NODE_ENV === 'test' || process.env.AIOS_MOCK === 'true') {
        const localBranchDir = path.join(RootResolver.resolvePlatform('posting-map'), '03_BRANCH', event.districtName);
        
        fs.writeFileSync(path.join(localBranchDir, 'district.json'), JSON.stringify(districtMetadata, null, 2), 'utf8');
        fs.writeFileSync(path.join(localBranchDir, 'config.json'), JSON.stringify(branchConfig, null, 2), 'utf8');
        
        console.log(`[DataBuilderRuntime] Written config.json and district.json to local mock workspace.`);
      } else {
        const token = await getClaspToken();
        const districtFolder = await getFolderByNameAndParent(event.districtName, BRANCH_ROOT_FOLDER_ID, token);
        if (!districtFolder) {
          throw new Error(`District folder not resolved: ${event.districtName}`);
        }
        await uploadJsonFile("district.json", districtMetadata, districtFolder.id, token);
        await uploadJsonFile("config.json", branchConfig, districtFolder.id, token);
        
        console.log(`[DataBuilderRuntime] Uploaded config.json and district.json to GDrive folder.`);
      }

      console.log(`[Audit Event] DATA_BUILDER_COMPLETED (Mission: ${event.missionId})`);

      const outputEvent = {
        type: "DATA_BUILD_COMPLETED",
        missionId: event.missionId,
        districtName: event.districtName,
        occurredAt: new Date().toISOString()
      };

      return {
        success: true,
        message: "Branch configurations built successfully.",
        outputEvent
      };

    } catch (err: any) {
      console.error(`[Audit Event] DATA_BUILDER_FAILED (Mission: ${event.missionId}, Error: ${err.message})`);
      return {
        success: false,
        message: `Config compilation failed: ${err.message}`
      };
    }
  }
}
