import { PlatformIntegrationPipeline } from '../src/platform/PlatformIntegrationPipeline';
import { GasConfigurationProvider } from '@infra/gas/GasConfigurationProvider';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const globalVar = globalThis as any;

// Mock GAS Globals
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

globalVar.LockService = {
  getScriptLock: () => ({
    tryLock: () => true,
    releaseLock: () => {}
  })
};

globalVar.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (key: string) => {
      if (key === 'FLAG_EDITION_VALIDATION') return 'true';
      if (key === 'FLAG_LICENSING_ENABLED') return 'true';
      return null;
    }
  })
};

// Mock the response wrapper used in GAS environment
globalVar.createJsonResponseFromApiResponse = (resp: any) => {
  return {
    body: resp
  };
};

// Mock UrlFetchApp for LINE Token verification
globalVar.UrlFetchApp = {
  fetch: (url: string, params?: any) => {
    console.log(`[Mock UrlFetchApp] Fetching: ${url}`);
    if (url.includes('access_token=real-user-token')) {
      return {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({
          client_id: '1234567890',
          expires_in: 3600,
          scope: 'profile'
        })
      };
    }
    return {
      getResponseCode: () => 400,
      getContentText: () => 'Bad Request'
    };
  }
};

// Mock Sheets
globalVar.SpreadsheetApp = {
  getActiveSpreadsheet: () => ({
    getId: () => 'mock-ss-id',
    getSheetByName: (name: string) => ({
      getName: () => name,
      getLastRow: () => 1,
      getRange: () => ({
        getValues: () => [['ID', '名前', 'アプリ名', 'LINE_USER_ID']],
        setValue: () => {}
      })
    })
  })
};

async function testLicenseResolution() {
  console.log("==================================================");
  console.log("🧪 Auditing Edition & Rank Resolution for LIFF Users");
  console.log("==================================================");

  // Scenario 1: Mock/Stub LIFF User
  {
    console.log("\n--- Scenario 1: Mock LIFF User (liffToken = 'stub-user-123') ---");
    const mockEvent = {
      parameter: {
        action: 'getAppData',
        version: 'v2',
        liffToken: 'stub-user-123'
      }
    };
    
    try {
      const response = await PlatformIntegrationPipeline.execute(mockEvent as any);
      console.log("Result: SUCCESS (No LicenseException thrown)");
      console.log("Response body:", JSON.stringify(response.body, null, 2));
    } catch (err: any) {
      console.error("Result: FAILED with error:", err.message);
    }
  }

  // Scenario 2: Real Authenticated LIFF User
  {
    console.log("\n--- Scenario 2: Real Authenticated LIFF User (liffToken = 'real-user-token') ---");
    const mockEvent = {
      parameter: {
        action: 'getAppData',
        version: 'v2',
        liffToken: 'real-user-token'
      }
    };
    
    try {
      const response = await PlatformIntegrationPipeline.execute(mockEvent as any);
      console.log("Result: SUCCESS (No LicenseException thrown)");
      console.log("Response body:", JSON.stringify(response.body, null, 2));
    } catch (err: any) {
      console.log("Result: LICENSE EXCEPTION THROWN! (Expected behavior under bug)");
      console.log("Error Message:", err.message);
      console.log("Error Details:", JSON.stringify(err.metadata || err || {}, null, 2));
    }
  }
}

testLicenseResolution();
