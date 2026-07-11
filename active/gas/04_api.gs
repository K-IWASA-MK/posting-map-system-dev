// =========================================
// Generated: active/gas/04_api.gs
// =========================================

// --- Source: src/infrastructure/gas/ApiExecutionContext.ts ---

class ApiExecutionContext {
  private requestId: string;
  private executionId: string;
  private startTimestamp: number;
  private retryCount: number = 0;
  private authContext: AuthenticationContext | null = null;
  private authzContext: AuthorizationContext | null = null;
  private licenseContext: LicenseContext | null = null;
  private featureContext: FeatureContext | null = null;
  private bridgeContext: BridgeContext | null = null;
  private platformCtx: PlatformExecutionContext | null = null;
  private currentStage: PlatformStage = PlatformStage.INITIALIZING;

  constructor() {
    this.startTimestamp = Date.now();
    this.requestId = `req-${this.startTimestamp}-${Math.random().toString(36).substr(2, 9)}`;
    this.executionId = `exec-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validationTime: number = 0;
  private routingTime: number = 0;
  private handlerTime: number = 0;

  public getRequestId(): string {
    return this.requestId;
  }

  public getExecutionId(): string {
    return this.executionId;
  }

  public getStartTimestamp(): number {
    return this.startTimestamp;
  }

  public getElapsedTime(): number {
    return Date.now() - this.startTimestamp;
  }

  public getRetryCount(): number {
    return this.retryCount;
  }

  public incrementRetry(): void {
    this.retryCount++;
  }

  public setValidationTime(ms: number): void {
    this.validationTime = ms;
  }

  public getValidationTime(): number {
    return this.validationTime;
  }

  public setRoutingTime(ms: number): void {
    this.routingTime = ms;
  }

  public getRoutingTime(): number {
    return this.routingTime;
  }

  public setHandlerTime(ms: number): void {
    this.handlerTime = ms;
  }

  public getHandlerTime(): number {
    return this.handlerTime;
  }

  public setAuthenticationContext(context: AuthenticationContext): void {
    this.authContext = context;
  }

  public getAuthenticationContext(): AuthenticationContext | null {
    return this.authContext;
  }

  public setAuthorizationContext(context: AuthorizationContext): void {
    this.authzContext = context;
  }

  public getAuthorizationContext(): AuthorizationContext | null {
    return this.authzContext;
  }

  public setLicenseContext(context: LicenseContext): void {
    this.licenseContext = context;
  }

  public getLicenseContext(): LicenseContext | null {
    return this.licenseContext;
  }

  public setFeatureContext(context: FeatureContext): void {
    this.featureContext = context;
  }

  public getFeatureContext(): FeatureContext | null {
    return this.featureContext;
  }

  public setBridgeContext(context: BridgeContext): void {
    this.bridgeContext = context;
  }

  public getBridgeContext(): BridgeContext | null {
    return this.bridgeContext;
  }

  public setPlatformContext(context: PlatformExecutionContext): void {
    this.platformCtx = context;
  }

  public getPlatformContext(): PlatformExecutionContext | null {
    return this.platformCtx;
  }

  public setCurrentStage(stage: PlatformStage): void {
    this.currentStage = stage;
  }

  public getCurrentStage(): PlatformStage {
    return this.currentStage;
  }
}


// --- Source: src/infrastructure/gas/CacheServiceProvider.ts ---

class CacheServiceProvider {
  private static instance: CacheServiceProvider | null = null;
  private configProvider: GasConfigurationProvider;

  private constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
  }

  public static getInstance(): CacheServiceProvider {
    if (!CacheServiceProvider.instance) {
      CacheServiceProvider.instance = new CacheServiceProvider();
    }
    return CacheServiceProvider.instance;
  }

  /**
   * キーの共通名前空間プレフィックスの生成
   */
  public makeKey(tenantId: string, branchId: string, category: string): string {
    return `${tenantId}:${branchId}:${category}`;
  }

  public get(key: string): string | null {
    if (typeof CacheService !== 'undefined') {
      try {
        const cache = CacheService.getScriptCache();
        return cache.get(key);
      } catch (e) {
        // Fallback for non-GAS runtimes
      }
    }
    return null;
  }

  public put(key: string, value: string, ttlSeconds?: number): void {
    if (typeof CacheService !== 'undefined') {
      try {
        const cache = CacheService.getScriptCache();
        const expiry = ttlSeconds !== undefined ? ttlSeconds : this.configProvider.getCacheTTL();
        
        // GAS CacheService limitation: max TTL is 21600 seconds (6 hours)
        const safeExpiry = Math.min(expiry, 21600);
        cache.put(key, value, safeExpiry);
      } catch (e) {
        // Fallback
      }
    }
  }

  public remove(key: string): void {
    if (typeof CacheService !== 'undefined') {
      try {
        const cache = CacheService.getScriptCache();
        cache.remove(key);
      } catch (e) {
        // Fallback
      }
    }
  }

  public invalidateAll(): void {
    // GAS ScriptCache has no clearAll. It will expire or keys must be removed individually.
  }
}

// Global declaration for GAS type safety during compiler checks
declare const CacheService: any;


// --- Source: src/infrastructure/gas/GasConfigurationProvider.ts ---
interface FeatureFlags {
  flyerHolding: boolean;
  googleMaps: boolean;
  mapbox: boolean;
  gpsEvidence: boolean;
  photoEvidence: boolean;
  aiosBridge: boolean;
  analytics: boolean;
  apiKeyAuth: boolean;
  liffAuth: boolean;
  serviceAuth: boolean;
  anonymousAccess: boolean;
  authorizationEnabled: boolean;
  roleValidation: boolean;
  scopeValidation: boolean;
  permissionValidation: boolean;
  licensingEnabled: boolean;
  editionValidation: boolean;
  licenseValidation: boolean;
  featureAccessEnabled: boolean;
  featureValidation: boolean;
  bridgeEnabled: boolean;
  bridgeHeartbeat: boolean;
  bridgeTimeout: number;
  bridgeProvider: string;
  platformIntegrationEnabled: boolean;
  pipelineMode: string;
  debugExecutionTrace: boolean;
}

class GasConfigurationProvider {
  private static instance: GasConfigurationProvider | null = null;
  private cacheTTL: number = 600; // 10 minutes
  private lockTimeout: number = 10000; // 10 seconds
  private apiVersion: string = "1.0.0-RC1";

  private constructor() {
    this.loadProperties();
  }

  public static getInstance(): GasConfigurationProvider {
    if (!GasConfigurationProvider.instance) {
      GasConfigurationProvider.instance = new GasConfigurationProvider();
    }
    return GasConfigurationProvider.instance;
  }

  private loadProperties(): void {
    if (typeof PropertiesService !== 'undefined') {
      try {
        const props = PropertiesService.getScriptProperties();
        const ttl = props.getProperty('CACHE_TTL');
        if (ttl) this.cacheTTL = parseInt(ttl, 10);

        const timeout = props.getProperty('LOCK_TIMEOUT');
        if (timeout) this.lockTimeout = parseInt(timeout, 10);
      } catch (e) {
        // Fallback for non-GAS runtimes (e.g. testing)
      }
    }
  }

  public getCacheTTL(): number {
    return this.cacheTTL;
  }

  public getLockTimeout(): number {
    return this.lockTimeout;
  }

  public getApiVersion(): string {
    return this.apiVersion;
  }

  public getSpreadsheetId(): string {
    if (typeof PropertiesService !== 'undefined') {
      const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
      if (id) return id;
    }
    return 'MOCK_SPREADSHEET_ID';
  }

  public getFieldRepositoryMode(): string {
    if (typeof PropertiesService !== 'undefined') {
      const mode = PropertiesService.getScriptProperties().getProperty('FIELD_REPOSITORY_MODE');
      if (mode) return mode;
    }
    return 'SPREADSHEET';
  }

  public getStorageParentFolderId(): string {
    if (typeof PropertiesService !== 'undefined') {
      const id = PropertiesService.getScriptProperties().getProperty('STORAGE_PARENT_ID');
      if (id) return id;
    }
    return 'MOCK_STORAGE_PARENT_ID';
  }

  public getFeatureFlags(): FeatureFlags {
    if (typeof PropertiesService !== 'undefined') {
      try {
        const props = PropertiesService.getScriptProperties();
        const timeoutStr = props.getProperty('BRIDGE_TIMEOUT');
        return {
          flyerHolding: props.getProperty('FLAG_FLYER_HOLDING') !== 'false',
          googleMaps: props.getProperty('FLAG_GOOGLE_MAPS') !== 'false',
          mapbox: props.getProperty('FLAG_MAPBOX') === 'true',
          gpsEvidence: props.getProperty('FLAG_GPS_EVIDENCE') !== 'false',
          photoEvidence: props.getProperty('FLAG_PHOTO_EVIDENCE') !== 'false',
          aiosBridge: props.getProperty('FLAG_AIOS_BRIDGE') === 'true',
          analytics: props.getProperty('FLAG_ANALYTICS') === 'true',
          apiKeyAuth: props.getProperty('FLAG_API_KEY_AUTH') !== 'false',
          liffAuth: props.getProperty('FLAG_LIFF_AUTH') !== 'false',
          serviceAuth: props.getProperty('FLAG_SERVICE_AUTH') !== 'false',
          anonymousAccess: props.getProperty('FLAG_ANONYMOUS_ACCESS') !== 'false',
          authorizationEnabled: props.getProperty('FLAG_AUTHORIZATION_ENABLED') !== 'false',
          roleValidation: props.getProperty('FLAG_ROLE_VALIDATION') !== 'false',
          scopeValidation: props.getProperty('FLAG_SCOPE_VALIDATION') !== 'false',
          permissionValidation: props.getProperty('FLAG_PERMISSION_VALIDATION') !== 'false',
          licensingEnabled: props.getProperty('FLAG_LICENSING_ENABLED') !== 'false',
          editionValidation: props.getProperty('FLAG_EDITION_VALIDATION') !== 'false',
          licenseValidation: props.getProperty('FLAG_LICENSE_VALIDATION') !== 'false',
          featureAccessEnabled: props.getProperty('FLAG_FEATURE_ACCESS_ENABLED') !== 'false',
          featureValidation: props.getProperty('FLAG_FEATURE_VALIDATION') !== 'false',
          bridgeEnabled: props.getProperty('FLAG_BRIDGE_ENABLED') !== 'false',
          bridgeHeartbeat: props.getProperty('FLAG_BRIDGE_HEARTBEAT') !== 'false',
          bridgeTimeout: timeoutStr ? parseInt(timeoutStr, 10) : 5000,
          bridgeProvider: props.getProperty('FLAG_BRIDGE_PROVIDER') || 'AIOSBridgeProvider',
          platformIntegrationEnabled: props.getProperty('FLAG_PLATFORM_INTEGRATION_ENABLED') !== 'false',
          pipelineMode: props.getProperty('FLAG_PIPELINE_MODE') || 'DETERMINISTIC',
          debugExecutionTrace: props.getProperty('FLAG_DEBUG_EXECUTION_TRACE') !== 'false'
        };
      } catch (e) {
        // Fallback below
      }
    }
    return {
      flyerHolding: true,
      googleMaps: true,
      mapbox: false,
      gpsEvidence: true,
      photoEvidence: true,
      aiosBridge: false,
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
    };
  }
}

// Global declaration for GAS type safety during compiler checks
declare const PropertiesService: any;


// --- Source: src/infrastructure/gas/GasPerformanceMonitor.ts ---
class GasPerformanceMonitor {
  private static instance: GasPerformanceMonitor | null = null;

  private spreadsheetReads: number = 0;
  private spreadsheetWrites: number = 0;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private lockWaitTime: number = 0;
  private lockAcquires: number = 0;

  private constructor() {}

  public static getInstance(): GasPerformanceMonitor {
    if (!GasPerformanceMonitor.instance) {
      GasPerformanceMonitor.instance = new GasPerformanceMonitor();
    }
    return GasPerformanceMonitor.instance;
  }

  public recordSpreadsheetRead(): void {
    this.spreadsheetReads++;
  }

  public recordSpreadsheetWrite(): void {
    this.spreadsheetWrites++;
  }

  public recordCacheHit(): void {
    this.cacheHits++;
  }

  public recordCacheMiss(): void {
    this.cacheMisses++;
  }

  public recordLockAcquired(waitTimeMs: number): void {
    this.lockAcquires++;
    this.lockWaitTime += waitTimeMs;
  }

  public reset(): void {
    this.spreadsheetReads = 0;
    this.spreadsheetWrites = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.lockWaitTime = 0;
    this.lockAcquires = 0;
  }

  public getMetrics() {
    return {
      spreadsheetReads: this.spreadsheetReads,
      spreadsheetWrites: this.spreadsheetWrites,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      lockWaitTime: this.lockWaitTime,
      lockAcquires: this.lockAcquires
    };
  }
}


// --- Source: src/infrastructure/gas/LockServiceProvider.ts ---

class LockServiceProvider {
  private static instance: LockServiceProvider | null = null;
  private configProvider: GasConfigurationProvider;

  private constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
  }

  public static getInstance(): LockServiceProvider {
    if (!LockServiceProvider.instance) {
      LockServiceProvider.instance = new LockServiceProvider();
    }
    return LockServiceProvider.instance;
  }

  /**
   * ロックを取得してアクションを実行する。実行後は確実にロックを解放する。
   */
  public executeWithLock<T>(action: () => T): T {
    if (typeof LockService === 'undefined') {
      // 非GAS環境（Nodeテスト等）では直接アクションを実行
      return action();
    }

    const lock = LockService.getScriptLock();
    const timeoutMs = this.configProvider.getLockTimeout();
    const hasLock = lock.tryLock(timeoutMs);

    if (!hasLock) {
      throw new Error(`Lock Timeout: Failed to acquire script lock within ${timeoutMs}ms.`);
    }

    try {
      return action();
    } finally {
      try {
        lock.releaseLock();
      } catch (releaseError) {
        console.error('[LockServiceProvider] Error releasing lock:', releaseError);
      }
    }
  }

  /**
   * 非同期でロックを取得してアクションを実行する。実行後は確実にロックを解放する。
   */
  public async executeWithLockAsync<T>(action: () => Promise<T>): Promise<T> {
    if (typeof LockService === 'undefined') {
      return await action();
    }

    const lock = LockService.getScriptLock();
    const timeoutMs = this.configProvider.getLockTimeout();
    const hasLock = lock.tryLock(timeoutMs);

    if (!hasLock) {
      throw new Error(`Lock Timeout: Failed to acquire script lock within ${timeoutMs}ms.`);
    }

    try {
      return await action();
    } finally {
      try {
        lock.releaseLock();
      } catch (releaseError) {
        console.error('[LockServiceProvider] Error releasing lock:', releaseError);
      }
    }
  }
}

// Global declaration for GAS type safety during compiler checks
declare const LockService: any;


// --- Source: src/infrastructure/gas/SpreadsheetBatchReader.ts ---

class SpreadsheetBatchReader {
  private configProvider: GasConfigurationProvider;
  private cachedSpreadsheet: any = null;

  constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
  }

  private getSpreadsheet(): any {
    if (this.cachedSpreadsheet) return this.cachedSpreadsheet;
    
    if (typeof SpreadsheetApp !== 'undefined') {
      const ssId = this.configProvider.getSpreadsheetId();
      this.cachedSpreadsheet = SpreadsheetApp.openById(ssId);
      return this.cachedSpreadsheet;
    }
    return null;
  }

  /**
   * 指定シートの全データを1回の getValues() で一括読み出しする
   */
  public readAll(sheetName: string): any[][] {
    const ss = this.getSpreadsheet();
    if (!ss) return [];

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];

      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow === 0 || lastCol === 0) return [];

      return sheet.getRange(1, 1, lastRow, lastCol).getValues();
    } catch (e) {
      console.error(`[SpreadsheetBatchReader] Error reading sheet ${sheetName}:`, e);
      return [];
    }
  }

  /**
   * 特定のレンジのみを一括取得する
   */
  public readRange(sheetName: string, startRow: number, startCol: number, numRows: number, numCols: number): any[][] {
    const ss = this.getSpreadsheet();
    if (!ss) return [];

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];

      return sheet.getRange(startRow, startCol, numRows, numCols).getValues();
    } catch (e) {
      console.error(`[SpreadsheetBatchReader] Error reading range from ${sheetName}:`, e);
      return [];
    }
  }
}

// Global declaration for GAS type safety during compiler checks
declare const SpreadsheetApp: any;


// --- Source: src/infrastructure/gas/SpreadsheetBatchWriter.ts ---

class SpreadsheetBatchWriter {
  private configProvider: GasConfigurationProvider;
  private cachedSpreadsheet: any = null;

  constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
  }

  private getSpreadsheet(): any {
    if (this.cachedSpreadsheet) return this.cachedSpreadsheet;
    
    if (typeof SpreadsheetApp !== 'undefined') {
      const ssId = this.configProvider.getSpreadsheetId();
      this.cachedSpreadsheet = SpreadsheetApp.openById(ssId);
      return this.cachedSpreadsheet;
    }
    return null;
  }

  /**
   * 複数行のデータを末尾へ一括追記する
   */
  public appendRows(sheetName: string, rows: any[][]): void {
    if (rows.length === 0) return;

    const ss = this.getSpreadsheet();
    if (!ss) return;

    try {
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      }

      const lastRow = sheet.getLastRow();
      const numCols = rows[0].length;
      
      sheet.getRange(lastRow + 1, 1, rows.length, numCols).setValues(rows);
    } catch (e) {
      console.error(`[SpreadsheetBatchWriter] Error appending to sheet ${sheetName}:`, e);
      throw e;
    }
  }

  /**
   * 特定の範囲を一括更新（上書き）する
   */
  public updateRange(sheetName: string, startRow: number, startCol: number, rows: any[][]): void {
    if (rows.length === 0) return;

    const ss = this.getSpreadsheet();
    if (!ss) return;

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        throw new Error(`Sheet ${sheetName} not found for updateRange.`);
      }

      sheet.getRange(startRow, startCol, rows.length, rows[0].length).setValues(rows);
    } catch (e) {
      console.error(`[SpreadsheetBatchWriter] Error updating range in sheet ${sheetName}:`, e);
      throw e;
    }
  }
}

// Global declaration for GAS type safety during compiler checks
declare const SpreadsheetApp: any;


// --- Source: src/infrastructure/gas/SpreadsheetRepository.ts ---

interface AreaRecord {
  areaId: string;
  name: string;
  cityName: string;
  status: string;
  doneCount: number;
  totalCount: number;
}

interface StaffRecord {
  lastName: string;
  firstName: string;
  status: string;
}

class SpreadsheetRepository {
  private reader: SpreadsheetBatchReader;
  private writer: SpreadsheetBatchWriter;

  constructor() {
    this.reader = new SpreadsheetBatchReader();
    this.writer = new SpreadsheetBatchWriter();
  }

  /**
   * エリア一覧情報を取得する
   */
  public getAreas(tenantId: string, branchId: string): AreaRecord[] {
    const rawRows = this.reader.readAll('Areas');
    if (rawRows.length <= 1) return []; // ヘッダーのみ、または空

    const records: AreaRecord[] = [];
    const headers = rawRows[0];

    // 列インデックスの動的特定 (ハードコード回避)
    const areaIdIdx = headers.indexOf('Area ID');
    const nameIdx = headers.indexOf('Name');
    const cityIdx = headers.indexOf('City');
    const statusIdx = headers.indexOf('Status');
    const doneIdx = headers.indexOf('Done Count');
    const totalIdx = headers.indexOf('Total Count');

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      records.push({
        areaId: areaIdIdx !== -1 ? String(row[areaIdIdx]) : '',
        name: nameIdx !== -1 ? String(row[nameIdx]) : '',
        cityName: cityIdx !== -1 ? String(row[cityIdx]) : '',
        status: statusIdx !== -1 ? String(row[statusIdx]) : 'NOT_STARTED',
        doneCount: doneIdx !== -1 ? Number(row[doneIdx]) : 0,
        totalCount: totalIdx !== -1 ? Number(row[totalIdx]) : 0
      });
    }

    return records;
  }

  /**
   * 複数件のイベントログを一括で追記保存する
   */
  public saveEventLogs(logs: any[]): void {
    if (logs.length === 0) return;

    const rawRows = this.reader.readAll('EventLogs');
    const headers = rawRows.length > 0 ? rawRows[0] : ['Event ID', 'Timestamp', 'Type', 'Payload'];

    const formattedRows = logs.map(log => {
      return headers.map(h => {
        if (h === 'Event ID') return log.eventId || `EV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        if (h === 'Timestamp') return log.timestamp || Date.now();
        if (h === 'Type') return log.type || 'unknown';
        if (h === 'Payload') return JSON.stringify(log.payload || {});
        return '';
      });
    });

    this.writer.appendRows('EventLogs', formattedRows);
  }

  /**
   * 配布員一覧を取得する
   */
  public getStaffs(): StaffRecord[] {
    const rawRows = this.reader.readAll('Staffs');
    if (rawRows.length <= 1) return [];

    const headers = rawRows[0];
    const lastIdx = headers.indexOf('Last Name');
    const firstIdx = headers.indexOf('First Name');
    const statusIdx = headers.indexOf('Status');

    const records: StaffRecord[] = [];
    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      records.push({
        lastName: lastIdx !== -1 ? String(row[lastIdx]) : '',
        firstName: firstIdx !== -1 ? String(row[firstIdx]) : '',
        status: statusIdx !== -1 ? String(row[statusIdx]) : 'ACTIVE'
      });
    }
    return records;
  }

  /**
   * 特定のエリアの状況をバッチで更新する
   */
  public updateAreaStatus(areaId: string, status: string): void {
    const rawRows = this.reader.readAll('Areas');
    if (rawRows.length <= 1) return;

    const headers = rawRows[0];
    const areaIdIdx = headers.indexOf('Area ID');
    const statusIdx = headers.indexOf('Status');

    if (areaIdIdx === -1 || statusIdx === -1) return;

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (String(row[areaIdIdx]) === areaId) {
        // 対象の行（1-indexed かつヘッダー込なので i + 1 行目）のステータス列（1-indexed なので statusIdx + 1 列目）
        this.writer.updateRange('Areas', i + 1, statusIdx + 1, [[status]]);
        break;
      }
    }
  }
}


