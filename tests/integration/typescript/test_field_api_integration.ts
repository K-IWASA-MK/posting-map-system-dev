import { PlatformIntegrationPipeline } from '../../../src/platform/PlatformIntegrationPipeline';
import { PlatformStage } from '../../../src/platform/PlatformStage';
import { GasConfigurationProvider } from '@infra/gas/GasConfigurationProvider';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const globalVar = globalThis as any;

// 1. Mock GAS globals for Integration Test
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
  'Flyers': [
    ['ID', 'Owner ID', 'Area ID', 'Quantity', 'Status', 'Created At', 'Updated At'],
    ['stock-100', 'owner-1', 'area-1', '1000', 'AVAILABLE', String(Date.now()), String(Date.now())]
  ],
  'Distributors': [
    ['ID', 'Name', 'Identity ID', 'Area IDs', 'Status'],
    ['dist-100', 'Distributor A', 'identity-1', 'area-1,area-2', 'ACTIVE']
  ],
  'EventLogs': [
    ['Event ID', 'Timestamp', 'Type', 'Payload']
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
        })
      };
    }
  })
};

globalVar.ContentService = {
  MimeType: {
    JSON: 'JSON'
  },
  createTextOutput: (content: string) => {
    let mimeType: string = '';
    return {
      setMimeType: (type: string) => {
        mimeType = type;
        return {
          content,
          mimeType
        };
      }
    };
  }
};

globalVar.createJsonResponseFromApiResponse = (apiResponse: any) => {
  return {
    body: apiResponse,
    mimeType: 'JSON'
  };
};

async function runTests() {
  console.log('[Integration Test] Starting Field API Integration Pipeline tests...');

  // Setup configuration provider overrides
  const config = GasConfigurationProvider.getInstance();
  config.getFeatureFlags = () => ({
    flyerHolding: true,
    googleMaps: true,
    mapbox: false,
    gpsEvidence: true,
    photoEvidence: true,
    aiosBridge: true,
    analytics: false,
    apiKeyAuth: true,
    liffAuth: true,
    serviceAuth: true,
    anonymousAccess: true,
    authorizationEnabled: true,
    roleValidation: true,
    scopeValidation: true,
    permissionValidation: true,
    licensingEnabled: true,
    editionValidation: true,
    licenseValidation: true,
    featureAccessEnabled: true,
    featureValidation: true,
    bridgeEnabled: true,
    bridgeHeartbeat: true,
    bridgeTimeout: 5000,
    bridgeProvider: 'AIOSBridgeProvider',
    platformIntegrationEnabled: true,
    pipelineMode: 'DETERMINISTIC',
    debugExecutionTrace: true
  });

  // Test Case 1: GET /field/stocks/{id} via path variable routing
  {
    const mockEvent = {
      parameter: {
        path: '/field/stocks/stock-100',
        version: 'v2',
        apiKey: 'valid-api-key'
      }
    };

    const response = await PlatformIntegrationPipeline.execute(mockEvent);
    assert(response !== null, 'Response should not be null');
    if (!response.body.success) {
      console.log('GET /field/stocks/stock-100 failed with response:', JSON.stringify(response.body, null, 2));
    }
    assert(response.body.success === true, 'GET stocks API call must succeed');
    assert(response.body.status === 200, 'HTTP status must be 200');
    
    // Verify DTO response shape
    const data = response.body.data;
    assert(data.id === 'stock-100', 'DTO ID mismatch');
    assert(data.quantity === 1000, 'DTO Quantity mismatch');
    assert(data.status === 'AVAILABLE', 'DTO Status mismatch');
    assert(data.ownerId === 'owner-1', 'DTO Owner ID mismatch');
    
    // Core check: no Domain Entity directly returned
    assert(data.getQuantity === undefined, 'Domain Entity methods must not leak in DTO response');
    assert(data.getStatus === undefined, 'Domain Entity methods must not leak in DTO response');

    console.log('[Integration Test] GET /field/stocks/{id} path parameter routing: PASSED');
  }

  // Test Case 2: GET /field/distributors/{id} path parameter routing
  {
    const mockEvent = {
      parameter: {
        path: '/field/distributors/dist-100',
        version: 'v2',
        apiKey: 'valid-api-key'
      }
    };

    const response = await PlatformIntegrationPipeline.execute(mockEvent);
    assert(response !== null, 'Response should not be null');
    assert(response.body.success === true, 'GET distributors API call must succeed');
    assert(response.body.status === 200, 'HTTP status must be 200');

    const data = response.body.data;
    assert(data.id === 'dist-100', 'DTO ID mismatch');
    assert(data.name === 'Distributor A', 'DTO Name mismatch');
    assert(data.status === 'ACTIVE', 'DTO Status mismatch');

    console.log('[Integration Test] GET /field/distributors/{id} path parameter routing: PASSED');
  }

  // Test Case 3: POST /field/reservation write action with locking & mapping
  {
    const mockEvent = {
      parameter: {
        path: '/field/reservation',
        version: 'v2',
        apiKey: 'valid-api-key'
      },
      postData: {
        contents: JSON.stringify({
          flyerStockId: 'stock-100',
          distributorId: 'dist-100',
          quantity: 300
        })
      }
    };

    mockScriptLock.hasLock = false;
    const response = await PlatformIntegrationPipeline.execute(mockEvent);
    assert(response !== null, 'Response should not be null');
    assert(response.body.success === true, 'POST reservation API call must succeed');
    assert(response.body.status === 200, 'HTTP status must be 200');

    const result = response.body.data;
    assert(result.success === true, 'ReservationResult success must be true');
    assert(result.stock.quantity === 700, 'Exposed flyer stock quantity must decrease');
    assert(result.stock.status === 'RESERVED', 'Status must transition to RESERVED');
    assert(result.eventIds.length === 1, 'Event ID must be mapped and returned');

    // Lock Service release validation
    assert(mockScriptLock.hasLock === false, 'Lock must be released after operation');

    console.log('[Integration Test] POST /field/reservation locking, execution & mapping: PASSED');
  }

  // Test Case 4: Route Not Found (ensure fallback logic is correct)
  {
    const mockEvent = {
      parameter: {
        path: '/field/invalid-route',
        version: 'v2',
        apiKey: 'valid-api-key'
      }
    };

    const response = await PlatformIntegrationPipeline.execute(mockEvent);
    assert(response.body.success === false, 'Invalid route must fail');
    assert(response.body.status === 404, 'HTTP status must be 404');
    assert(response.body.error.code === 'PM-VAL-001', 'Error code must match');

    console.log('[Integration Test] Route Fallback: PASSED');
  }

  console.log('[Integration Test] All Field API Integration Pipeline tests completed.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  FIELD API INTEGRATION TESTS PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[Integration Test Failure]', err);
  process.exit(1);
});
