import { PlatformIntegrationPipeline } from '../../../src/platform/PlatformIntegrationPipeline';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const globalVar = globalThis as any;

let mockCacheStore: { [key: string]: string } = {};
globalVar.CacheService = {
  getScriptCache: () => ({
    get: (key: string) => mockCacheStore[key] || null,
    put: (key: string, val: string, ttl: number) => {
      mockCacheStore[key] = val;
    },
    remove: (key: string) => {
      delete mockCacheStore[key];
    }
  })
};

let mockScriptLock = {
  hasLock: false,
  tryLock: (timeout: number) => {
    mockScriptLock.hasLock = true;
    return true;
  },
  releaseLock: () => {
    mockScriptLock.hasLock = false;
  }
};
globalVar.LockService = {
  getScriptLock: () => mockScriptLock
};

globalVar.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (key: string) => null
  })
};

let mockSheets: { [name: string]: any[][] } = {
  'Workspaces': [
    ['ワークスペースID', 'ワークスペース名', 'ステータス'],
    ['WS-MIE-01', '三重県 第1支部', 'ACTIVE'],
    ['WS-MIE-02', '三重県 第2支部', 'ACTIVE'],
    ['WS-MIE-03', '三重県 第3支部', 'ACTIVE']
  ],
  'Subscriptions': [
    ['ワークスペースID', 'ステータス', '開始日', '期限日'],
    ['WS-MIE-01', 'ACTIVE', '2026-07-01T00:00:00.000Z', new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()],
    ['WS-MIE-02', 'SUSPENDED', '2026-07-01T00:00:00.000Z', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()],
    ['WS-MIE-03', 'ACTIVE', '2026-07-01T00:00:00.000Z', new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()]
  ]
};

globalVar.SpreadsheetApp = {
  openById: (id: string) => ({
    getSheetByName: (name: string) => {
      if (!mockSheets[name]) return null;
      return {
        getLastRow: () => mockSheets[name].length,
        getLastColumn: () => mockSheets[name][0].length,
        getRange: (row: number, col: number, numRows: number, numCols: number) => ({
          getValues: () => {
            const data = [];
            for (let r = 0; r < numRows; r++) {
              const rowIndex = row - 1 + r;
              if (rowIndex < mockSheets[name].length) {
                data.push(mockSheets[name][rowIndex].slice(col - 1, col - 1 + numCols));
              }
            }
            return data;
          },
          setValues: (vals: any[][]) => {
            for (let r = 0; r < numRows; r++) {
              const rowIndex = row - 1 + r;
              if (rowIndex >= mockSheets[name].length) {
                mockSheets[name].push([]);
              }
              for (let c = 0; c < vals[r].length; c++) {
                mockSheets[name][rowIndex][col - 1 + c] = vals[r][c];
              }
            }
          }
        }),
        appendRow: (rowVals: any[]) => {
          mockSheets[name].push(rowVals);
        }
      };
    }
  })
};

globalVar.createJsonResponseFromApiResponse = (apiResponse: any) => {
  return {
    body: apiResponse,
    mimeType: 'JSON'
  };
};

async function runIntegrationTest() {
  console.log('[Integration Test Onboarding] Starting workspace onboarding flow integration test...');

  // 1. POST /operations/workspaces to create a new workspace
  const postEvent = {
    parameter: {
      action: 'operations/workspaces',
      apiKey: 'valid-api-key',
      version: 'v2'
    },
    postData: {
      contents: JSON.stringify({
        action: 'operations/workspaces',
        apiKey: 'valid-api-key',
        version: 'v2',
        workspaceName: '三重県 第4支部'
      })
    }
  };

  const postResponse = await PlatformIntegrationPipeline.execute(postEvent);
  assert(postResponse !== null, 'Response should not be null');
  assert(postResponse.body !== undefined, 'Response must contain body');

  const postBody = postResponse.body;
  assert(postBody.status === 200, `Expected status 200, got ${postBody.status}`);
  assert(postBody.success === true, 'Expected success: true');

  const createdData = postBody.data;
  assert(createdData.workspaceId === 'mie-04', `Expected workspaceId mie-04, got ${createdData.workspaceId}`);
  assert(createdData.status === 'ACTIVE', 'Expected ACTIVE status');
  assert(createdData.lineAppUrl === 'https://liff.line.me/2010177345-tXZIMAJK/mie-04', 'Line App URL mismatch');
  assert(createdData.dashboardUrl === 'https://posting-map.jp/dashboard/mie-04', 'Dashboard URL mismatch');

  // Verify stored rows in the sheet
  const workspacesSheet = mockSheets['Workspaces'];
  const createdWsRow = workspacesSheet.find(row => row[0] === 'mie-04');
  assert(createdWsRow !== undefined, 'Workspace row was not created in spreadsheet');
  assert(createdWsRow![1] === '三重県 第4支部', 'Workspace name mismatch in spreadsheet');
  assert(createdWsRow![2] === 'ACTIVE', 'Workspace status should be ACTIVE in spreadsheet');

  const subscriptionsSheet = mockSheets['Subscriptions'];
  const createdSubRow = subscriptionsSheet.find(row => row[0] === 'mie-04');
  assert(createdSubRow !== undefined, 'Subscription row was not created in spreadsheet');
  assert(createdSubRow![1] === 'ACTIVE', 'Subscription status mismatch in spreadsheet');

  // 2. GET /operations/workspaces to retrieve status
  const getEvent = {
    parameter: {
      action: 'operations/workspaces',
      apiKey: 'valid-api-key',
      version: 'v2',
      workspaceId: 'mie-04'
    }
  };

  const getResponse = await PlatformIntegrationPipeline.execute(getEvent);
  assert(getResponse !== null, 'Response should not be null');
  
  const getBody = getResponse.body;
  assert(getBody.status === 200, `Expected status 200, got ${getBody.status}`);
  assert(getBody.success === true, 'Expected success: true');

  const retrievedData = getBody.data;
  assert(retrievedData.workspaceId === 'mie-04', 'ID mismatch');
  assert(retrievedData.workspaceName === '三重県 第4支部', 'Name mismatch');
  assert(retrievedData.subscriptionStatus === 'ACTIVE', 'Subscription status mismatch');
  assert(retrievedData.lineAppUrl === 'https://liff.line.me/2010177345-tXZIMAJK/mie-04', 'Line URL mismatch');
  assert(retrievedData.dashboardUrl === 'https://posting-map.jp/dashboard/mie-04', 'Dashboard URL mismatch');

  // 3. Test duplicate ID logic during onboarding flow (mie-04 -> mie-04-2)
  console.log('[Integration Test Onboarding] Verifying duplicate ID auto-increment in onboarding flow...');
  const duplicatePostEvent = {
    parameter: {
      action: 'operations/workspaces',
      apiKey: 'valid-api-key',
      version: 'v2'
    },
    postData: {
      contents: JSON.stringify({
        action: 'operations/workspaces',
        apiKey: 'valid-api-key',
        version: 'v2',
        workspaceName: '三重県 第4支部' // This maps to mie-04 which already exists
      })
    }
  };

  const dupPostResponse = await PlatformIntegrationPipeline.execute(duplicatePostEvent);
  const dupPostBody = dupPostResponse.body;
  assert(dupPostBody.status === 200, `Expected status 200, got ${dupPostBody.status}`);
  assert(dupPostBody.data.workspaceId === 'mie-04-2', `Expected suffix incremented ID mie-04-2, got ${dupPostBody.data.workspaceId}`);

  console.log('[Integration Test Onboarding] Workspace onboarding flow integration test: PASSED.');
}

runIntegrationTest().catch(error => {
  console.error('[Integration Test Onboarding] Failed!');
  console.error(error);
  process.exit(1);
});
