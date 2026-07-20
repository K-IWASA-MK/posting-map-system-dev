import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Mission } from './MissionCreator';
import { RootResolver } from '../../../../../tools/review/RootResolver';

const BRANCH_ROOT_FOLDER_ID = "1EQQqWbtyF7iMd7Fk-WnUwWiAGB4MdIdN"; // FIELD_OPERATIONS_PLATFORM/03_BRANCH

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
  const existing = await getFolderByNameAndParent(name, parentId, token);
  if (existing) return existing.id;
  
  const createRes = await driveFetch(`files`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId]
    })
  });
  return createRes.id;
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

export class ResearchTrigger {
  public static async trigger(mission: Mission): Promise<{ success: boolean; message: string }> {
    console.log(`[ResearchTrigger] Research Agent起動`);
    console.log(`[ResearchTrigger] 市町村取得待ち`);

    // Municipalities mapping based on district
    let municipalities: string[] = [];
    if (mission.districtName === "東京第18区") {
      municipalities = ["武蔵野市", "小金井市", "西東京市"];
    } else if (mission.districtName === "大阪第6区") {
      municipalities = ["大阪市旭区", "大阪市城東区"];
    } else {
      municipalities = ["未調査市町村"];
    }

    const payload = {
      districtName: mission.districtName,
      municipalities
    };

    // If running in local unit test or simulation fallback, write locally
    if (process.env.NODE_ENV === 'test' || process.env.AIOS_MOCK === 'true') {
      const localBranchDir = path.join(RootResolver.resolvePlatform('posting-map'), '03_BRANCH', mission.districtName);
      if (!fs.existsSync(localBranchDir)) {
        fs.mkdirSync(localBranchDir, { recursive: true });
      }
      fs.writeFileSync(path.join(localBranchDir, 'research-result.json'), JSON.stringify(payload, null, 2), 'utf8');
      console.log(`[ResearchTrigger] Written research result to local mock workspace for ${mission.districtName}.`);
      return {
        success: true,
        message: "Research Agent Completed (Local Mock)"
      };
    }

    // Production: Upload to Google Drive
    try {
      const token = await getClaspToken();
      const districtFolderId = await createFolder(mission.districtName, BRANCH_ROOT_FOLDER_ID, token);
      await uploadJsonFile("research-result.json", payload, districtFolderId, token);
      
      console.log(`[ResearchTrigger] Successfully uploaded research-result.json to Drive for ${mission.districtName}.`);
      return {
        success: true,
        message: "Research Agent Completed (Google Drive)"
      };
    } catch (err: any) {
      console.error(`[ResearchTrigger] Upload failed: ${err.message}. Saving to local fallback.`);
      // Fallback local write
      const localBranchDir = path.join(RootResolver.resolvePlatform('posting-map'), '03_BRANCH', mission.districtName);
      if (!fs.existsSync(localBranchDir)) {
        fs.mkdirSync(localBranchDir, { recursive: true });
      }
      fs.writeFileSync(path.join(localBranchDir, 'research-result.json'), JSON.stringify(payload, null, 2), 'utf8');
      
      return {
        success: true,
        message: `Research Agent Completed with Google Drive upload fallback: ${err.message}`
      };
    }
  }
}
