import * as fs from 'fs';
import * as path from 'path';

const LOCAL_WORKSPACE_ROOT = path.join(__dirname, '..', '..', '..', '..', '..');

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

export class AssetCloner {
  public static async cloneSpreadsheet(
    templateId: string,
    name: string,
    parentFolderId: string,
    token: string,
    isMock: boolean = false
  ): Promise<string> {
    if (isMock) {
      // Mock spreadsheet cloning by generating dummy file path ID
      const mockId = `mock-spreadsheet-${Date.now()}`;
      const mockPath = path.join(LOCAL_WORKSPACE_ROOT, 'FIELD_OPERATIONS_PLATFORM', '03_BRANCH', name, 'spreadsheet.json');
      fs.writeFileSync(mockPath, JSON.stringify({ spreadsheetId: mockId, name }, null, 2), 'utf8');
      return mockId;
    }

    // Google Drive copy API
    const url = `files/${templateId}/copy`;
    const payload = {
      name: `${name} Spreadsheet`,
      parents: [parentFolderId]
    };
    const res = await driveFetch(url, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.id;
  }

  public static async createStorageFolder(
    name: string,
    parentFolderId: string,
    token: string,
    isMock: boolean = false
  ): Promise<string> {
    if (isMock) {
      const mockId = `mock-storage-${Date.now()}`;
      const mockPath = path.join(LOCAL_WORKSPACE_ROOT, 'FIELD_OPERATIONS_PLATFORM', '03_BRANCH', name, 'storage');
      if (!fs.existsSync(mockPath)) {
        fs.mkdirSync(mockPath, { recursive: true });
      }
      return mockId;
    }

    // Google Drive folder create API
    const payload = {
      name: 'storage',
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    };
    const res = await driveFetch('files', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.id;
  }

  public static async deleteFileOrFolder(id: string, token: string, isMock: boolean = false): Promise<void> {
    if (isMock) {
      // Stub delete
      console.log(`[Mock AssetCloner] Deleted mock asset ID: ${id}`);
      return;
    }

    await driveFetch(`files/${id}`, token, {
      method: 'DELETE'
    });
  }
}
