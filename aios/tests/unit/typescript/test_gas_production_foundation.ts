import { GasConfigurationProvider } from '@infra/gas/GasConfigurationProvider';
import { CacheServiceProvider } from '@infra/gas/CacheServiceProvider';
import { LockServiceProvider } from '@infra/gas/LockServiceProvider';
import { SpreadsheetBatchReader } from '@infra/gas/SpreadsheetBatchReader';
import { SpreadsheetBatchWriter } from '@infra/gas/SpreadsheetBatchWriter';
import { SpreadsheetRepository } from '@infra/gas/SpreadsheetRepository';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { GasPerformanceMonitor } from '@infra/gas/GasPerformanceMonitor';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const globalVar = globalThis as any;

// Mock GAS globals
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

let mockScriptLock: { hasLock: boolean; tryLock: (t: number) => boolean; releaseLock: () => void } = {
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

// Mock Spreadsheet App
let mockSheets: { [name: string]: any[][] } = {
  'Areas': [
    ['Area ID', 'Name', 'City', 'Status', 'Done Count', 'Total Count'],
    ['A-1', 'Area 1', 'City A', 'NOT_STARTED', 0, 100],
    ['A-2', 'Area 2', 'City B', 'IN_PROGRESS', 50, 100]
  ],
  'Workspaces': [
    ['ワークスペースID', 'ワークスペース名', 'ステータス'],
    ['WS-MIE-03', '三重第3支部', 'ACTIVE']
  ],
  'Subscriptions': [
    ['ワークスペースID', 'ステータス', '開始日', '期限日'],
    ['WS-MIE-03', 'ACTIVE', '2026-07-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z']
  ],
  'EventLogs': [
    ['Event ID', 'Timestamp', 'Type', 'Payload']
  ],
  'Staffs': [
    ['Last Name', 'First Name', 'Status'],
    ['Iwasa', 'Katsuji', 'ACTIVE']
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
    },
    insertSheet: (name: string) => {
      mockSheets[name] = [['Event ID', 'Timestamp', 'Type', 'Payload']];
      return {
        getLastRow: () => 1,
        getLastColumn: () => 4,
        getRange: (row: number, col: number, numRows: number, numCols: number) => ({
          setValues: (vals: any[][]) => {
            mockSheets[name] = [mockSheets[name][0], ...vals];
          }
        })
      };
    }
  })
};

async function runTests() {
  console.log('[Test GASProduction] Starting GAS API Production Foundation tests...');

  // 1. GasConfigurationProvider Test
  {
    const config = GasConfigurationProvider.getInstance();
    assert(config.getCacheTTL() === 600, 'Default TTL mismatch');
    assert(config.getLockTimeout() === 10000, 'Default lock timeout mismatch');
    assert(config.getApiVersion() === '1.0.0-RC1', 'API Version mismatch');
    assert(config.getSpreadsheetId() === 'MOCK_SPREADSHEET_ID', 'Default SS ID mismatch');
    console.log('[Test GASProduction] GasConfigurationProvider: PASSED');
  }

  // 2. CacheServiceProvider Test
  {
    const cache = CacheServiceProvider.getInstance();
    const key = cache.makeKey('TENANT-1', 'BRANCH-1', 'areas');
    
    // Cache Miss
    assert(cache.get(key) === null, 'Should return null on cache miss');
    
    // Cache Put & Hit
    cache.put(key, 'test-cached-data');
    assert(cache.get(key) === 'test-cached-data', 'Cache hit value mismatch');

    // Cache Remove
    cache.remove(key);
    assert(cache.get(key) === null, 'Cache remove failure');

    console.log('[Test GASProduction] CacheServiceProvider: PASSED');
  }

  // 3. LockServiceProvider Test
  {
    const lockProvider = LockServiceProvider.getInstance();
    let executed: boolean = false;
    lockProvider.executeWithLock(() => {
      executed = true;
      assert(mockScriptLock.hasLock, 'Lock should be held during execution');
    });
    assert(executed, 'Action should be executed');
    assert(!mockScriptLock.hasLock, 'Lock should be released after execution');

    console.log('[Test GASProduction] LockServiceProvider: PASSED');
  }

  // 4. Decoupled Spreadsheet Repository and Batch Reader/Writer
  {
    const repo = new SpreadsheetRepository();
    
    // Get Areas
    const areas = repo.getAreas('TENANT-1', 'BRANCH-1');
    assert(areas.length === 2, 'Should load 2 areas');
    assert(areas[0].areaId === 'A-1', 'Area 1 ID mismatch');
    assert(areas[0].status === 'NOT_STARTED', 'Area 1 Status mismatch');
    assert(areas[1].areaId === 'A-2', 'Area 2 ID mismatch');
    assert(areas[1].status === 'IN_PROGRESS', 'Area 2 Status mismatch');

    // Save EventLogs (Batch Write)
    const newLogs = [
      { eventId: 'EV-1', timestamp: 12345, type: 'gps-updated', payload: { lat: 35.1, lng: 136.2 } },
      { eventId: 'EV-2', timestamp: 12346, type: 'photo-updated', payload: { url: 'https://test.photo' } }
    ];
    repo.saveEventLogs(newLogs);
    
    // Verify physical I/O appended the data to EventLogs mock sheet
    const eventLogs = mockSheets['EventLogs'];
    assert(eventLogs.length === 3, 'EventLogs should have headers + 2 logs');
    assert(eventLogs[1][0] === 'EV-1', 'Log 1 ID mismatch');
    assert(eventLogs[2][0] === 'EV-2', 'Log 2 ID mismatch');

    // Update Area Status
    repo.updateAreaStatus('A-1', 'COMPLETED');
    const updatedAreas = repo.getAreas('TENANT-1', 'BRANCH-1');
    assert(updatedAreas[0].status === 'COMPLETED', 'Area 1 Status update failed');

    console.log('[Test GASProduction] Decoupled SpreadsheetRepository / Reader / Writer: PASSED');
  }

  // 5. ApiExecutionContext Test
  {
    const ctx = new ApiExecutionContext();
    assert(ctx.getRequestId().startsWith('req-'), 'Request ID prefix mismatch');
    assert(ctx.getExecutionId().startsWith('exec-'), 'Execution ID prefix mismatch');
    assert(ctx.getRetryCount() === 0, 'Initial retry count should be 0');
    
    ctx.incrementRetry();
    assert(ctx.getRetryCount() === 1, 'Increment retry failed');
    assert(ctx.getElapsedTime() >= 0, 'Elapsed time should be positive');

    console.log('[Test GASProduction] ApiExecutionContext: PASSED');
  }

  // 6. GasPerformanceMonitor Test
  {
    const monitor = GasPerformanceMonitor.getInstance();
    monitor.reset();
    
    monitor.recordSpreadsheetRead();
    monitor.recordSpreadsheetWrite();
    monitor.recordCacheHit();
    monitor.recordCacheMiss();
    monitor.recordLockAcquired(50);

    const metrics = monitor.getMetrics();
    assert(metrics.spreadsheetReads === 1, 'Read count mismatch');
    assert(metrics.spreadsheetWrites === 1, 'Write count mismatch');
    assert(metrics.cacheHits === 1, 'Cache Hit count mismatch');
    assert(metrics.cacheMisses === 1, 'Cache Miss count mismatch');
    assert(metrics.lockAcquires === 1, 'Lock Acquires mismatch');
    assert(metrics.lockWaitTime === 50, 'Lock Wait Time mismatch');

    console.log('[Test GASProduction] GasPerformanceMonitor: PASSED');
  }

  console.log('[Test GASProduction] All GAS API Production Foundation tests completed successfully.');
}

runTests().then(() => {
  console.log('\n======================================');
  console.log('  GAS API PRODUCTION FOUNDATION PASSED');
  console.log('======================================\n');
}).catch(err => {
  console.error('[GASProduction Test Failure]', err);
  if (typeof (globalThis as any).process !== 'undefined') {
    (globalThis as any).process.exit(1);
  }
});
