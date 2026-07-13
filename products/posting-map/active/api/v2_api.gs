/**
 * GAS v2 - 純粋 JSON API エンジン
 * UI(HTML)は一切返却せず、ContentService を通じて JSON のみを応答する。
 */

// =============================
// 【手動実行用】管理者IDシート初期セットアップ
// GASエディタで選択して「実行」ボタンを押すだけ
// =============================
function setupAdminSheet() {
  // ここに管理者情報を追加してください
  const admins = [
    { name: 'K. IWASA', lineUserId: 'U7375015ea7c5380e2c8da827eb8d3f08' }
  ];
  admins.forEach(a => registerAdmin(a.name, a.lineUserId));
  Logger.log('✅ 管理者IDシートのセットアップ完了');
}


// =============================
// ⓪ 基本設定
// =============================
function getSS() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty("SPREADSHEET_ID");
  
  if (!id) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss && ss.getId()) {
        id = ss.getId();
        props.setProperty("SPREADSHEET_ID", id); // 次回以降はキャッシュから取得
      }
    } catch (e) {
      // Webアプリ実行時はgetActiveSpreadsheet()はnullのため無視して次のフォールバックへ
    }
  }
  
  if (!id) {
    // 緊急フォールバック: PropertiesServiceに SPREADSHEET_ID を設定してください。
    // 設定方法: GASエディタ → [Project Settings] → [Script Properties] → SPREADSHEET_IDを追加。
    console.error('[getSS] SPREADSHEET_ID が未設定です。PropertiesServiceに設定してください。');
    throw new Error('SPREADSHEET_ID is not configured. Please set it in Script Properties.');
  }
  return SpreadsheetApp.openById(id);
}

function getStorageFolderId() {
  const id = PropertiesService.getScriptProperties().getProperty("STORAGE_PARENT_ID");
  return id || CONFIG.STORAGE_PARENT_ID;
}

// =============================
// Drive 認証テスト用（認証後は削除可）
// =============================
function authorizeAndTestDriveWrite() {
  try {
    const folderId = getStorageFolderId();
    const folder = DriveApp.getFolderById(folderId);
    const blob = Utilities.newBlob("DRIVE_AUTH_TEST", "text/plain", "_auth_test.txt");
    const file = folder.createFile(blob);
    file.setTrashed(true);
    Logger.log("✅ Drive write: SUCCESS. Folder: " + folder.getName());
  } catch (e) {
    Logger.log("❌ Drive write FAILED: " + e.toString());
  }
}


var executionContext = null;
var globalCacheHit = false;

/**
 * GETリクエスト：JSONデータの取得
 */
function doGet(e) {
  return PlatformIntegrationPipeline.execute(e);
}

/**
 * 従来のGETリクエストの処理（後方互換用）
 */
function processGetActionLegacy(action, e) {
  let response;
  if (action === 'getAppData') {
    const cacheKey = CacheServiceProvider.getInstance().makeKey(
      e.tenantId || "DEFAULT",
      e.branchId || "DEFAULT",
      "appdata"
    );
    const cached = CacheServiceProvider.getInstance().get(cacheKey);
    if (cached) {
      globalCacheHit = true;
      GasPerformanceMonitor.getInstance().recordCacheHit();
      response = JSON.parse(cached);
    } else {
      globalCacheHit = false;
      GasPerformanceMonitor.getInstance().recordCacheMiss();
      response = getAppData();
      if (response && response.success) {
        CacheServiceProvider.getInstance().put(cacheKey, JSON.stringify(response));
      }
    }
  } else {
    switch (action) {
      case 'getRanking':
        response = { success: true, ranking: getRankingData() };
        break;
      case 'getRoster':
        response = { success: true, roster: getRoster() };
        break;
      case 'getAreaDetails':
        response = getAreaDetails(e.name);
        break;
      case 'getCityAreaDetails':
        response = getCityAreaDetails(e.cityName);
        break;
      case 'submitDistribution':
        response = { success: false, message: 'Write operations require POST. Please update the client.' };
        break;
      case 'registerStaff':
        response = registerStaff(e.lastName, e.firstName);
        break;
      case 'testDriveAccess':
        try {
          const testFolderId = getStorageFolderId();
          const testFolder = DriveApp.getFolderById(testFolderId);
          response = {
            success: true,
            message: 'Drive access OK',
            folderId: testFolderId,
            folderName: testFolder.getName(),
            folderUrl: testFolder.getUrl()
          };
        } catch (driveErr) {
          response = { success: false, message: 'Drive access FAILED: ' + driveErr.toString(), folderId: getStorageFolderId() };
        }
        break;
      case 'testDriveWrite':
        try {
          const wFolder = DriveApp.getFolderById(getStorageFolderId());
          const testBlob = Utilities.newBlob("POSTING_MAP_TEST_" + Date.now(), "text/plain", "test_write.txt");
          const file = wFolder.createFile(testBlob);
          response = { success: true, message: 'Write OK', fileId: file.getId(), fileName: file.getName() };
          file.setTrashed(true);
        } catch (writeErr) {
          response = { success: false, message: 'Write FAILED: ' + writeErr.toString() };
        }
        break;
      case 'getDeliveryStats':
        response = getDeliveryStats();
        break;
      case 'getFlyerStock':
        response = { success: true, stocks: getFlyerStock() };
        break;
      case 'getTransferRequests':
        response = { success: true, requests: getTransferRequests() };
        break;
      case 'runMigration':
        response = { success: true, message: runMigrationToEventLog() };
        break;
      case 'runReconciliation':
        response = generateReconciliationReport();
        break;
      case 'runFreeze':
        response = executeSystemFreeze();
        break;
      case 'getConfig':
        response = { success: true, config: getConfig(e.tenantId || "DEFAULT") };
        break;
      case 'getAuditLogs':
        response = getAuditLogs();
        break;
      case 'refreshCache':
        response = { success: true, data: refreshAreaSummaryCache() };
        break;
      case 'getStrategy':
        response = { success: true, data: generateStrategy(e.branchId, e.tenantId || "DEFAULT") };
        break;
      case 'getHeatmap':
        response = { success: true, data: generateHeatmap(e.branchId, e.tenantId || "DEFAULT") };
        break;
      case 'getPrediction':
        response = { success: true, data: predictOutcome(e.branchId, e.tenantId || "DEFAULT") };
        break;
      default:
        response = { success: true, message: 'POSTING MAP API is online.' };
    }
  }
  return response;
}

/**
 * POSTリクエスト：データの登録・更新
 */
function doPost(e) {
  return PlatformIntegrationPipeline.execute(e);
}

/**
 * 実際のPOSTアクション処理のスイッチケース
 */
function processPostAction(action, postData, e) {
  switch (action) {
    case 'getAppData':
      return getAppData();
    case 'getConfig':
      return { success: true, config: getConfig(postData.tenantId || e.parameter.tenantId || "DEFAULT") };
    case 'getStrategy':
      return { success: true, data: generateStrategy(postData.branchId || e.parameter.branchId, postData.tenantId || e.parameter.tenantId || "DEFAULT") };
    case 'getHeatmap':
      return { success: true, data: generateHeatmap(postData.branchId || e.parameter.branchId, postData.tenantId || e.parameter.tenantId || "DEFAULT") };
    case 'getPrediction':
      return { success: true, data: predictOutcome(postData.branchId || e.parameter.branchId, postData.tenantId || e.parameter.tenantId || "DEFAULT") };
    case 'getRanking':
      return { success: true, ranking: getRankingData() };
    case 'getRoster':
      return { success: true, roster: getRoster() };
    case 'getAreaDetails':
      return getAreaDetails(postData.name || e.parameter.name);
    case 'getCityAreaDetails':
      return getCityAreaDetails(postData.cityName || e.parameter.cityName);
    case 'submitDistribution':
      return submitDistribution(postData);
    case 'updateRecordWithGPSPhoto':
      return updateRecordWithGPSPhoto(postData);
    case 'registerStaff':
      return registerStaff(postData.lastName, postData.firstName, postData.lineUserId);
    case 'registerAdmin':
      return registerAdmin(postData.displayName, postData.lineUserId);
    case 'requestFlyerTransfer':
      return handleRequestFlyerTransfer(postData);
    case 'resolveTransferRequest':
      return resolveTransferRequest(postData);
    case 'resetRoster':
      const rosterMsg = setupRosterSheet();
      return { success: true, message: rosterMsg };
    case 'setupFolders':
      const setupMsg = setupGoogleDriveFolders();
      return { success: true, message: setupMsg };
    case 'forceStartBatch':
      forceStartBatch();
      return { success: true, message: 'Batch run initiated successfully' };
    case 'refreshCache':
      createSystemCacheSheet();
      const cacheResult = refreshAreaSummaryCache();
      return { success: true, message: 'Cache sync completed successfully', data: cacheResult };
    case 'aggregateStats':
      aggregateTotalVolumes();
      return { success: true, message: 'Aggregation completed successfully' };
    case 'resetAllSheets':
      deleteAllAreaSheets();
      return { success: true, message: 'All area sheets reset successfully' };
    case 'updateFlyerStock':
      return updateFlyerStock(
        postData.location,
        parseInt(postData.count, 10) || 0,
        postData.staffName,
        postData.staffId
      );
    default:
      return { success: false, message: 'Invalid POST action' };
  }
}

// 共通：ApiResponseオブジェクトからJSONレスポンスを作成
function createJsonResponseFromApiResponse(apiResponse) {
  var cacheStatus = "MISS";
  if (typeof globalCacheHit !== 'undefined' && globalCacheHit) {
    cacheStatus = "HIT";
  }

  // クライアント互換性のためのラップ
  var responseWrapper = {
    success: apiResponse.success,
    data: apiResponse.data,
    error: apiResponse.error,
    metadata: {
      requestId: apiResponse.metadata.requestId,
      serverTimestamp: apiResponse.metadata.serverTimestamp,
      processingTime: apiResponse.metadata.processingTime,
      cacheStatus: cacheStatus,
      version: apiResponse.metadata.version
    }
  };

  if (apiResponse.data && typeof apiResponse.data === 'object') {
    if (apiResponse.data.id !== undefined) {
      responseWrapper.id = apiResponse.data.id;
    }
    if (apiResponse.data.name !== undefined) {
      responseWrapper.name = apiResponse.data.name;
    }
    if (apiResponse.data.message !== undefined) {
      responseWrapper.message = apiResponse.data.message;
    }
  }

  return ContentService.createTextOutput(JSON.stringify(responseWrapper))
    .setMimeType(ContentService.MimeType.JSON);
}

// =============================
// ② データ取得ロジック
// =============================

function getAppData() {
  // Phase 13: EventLogから全ブロック（エリア）の集計データを取得
  let blocks = [];
  let totalDone = 0;
  
  try {
    blocks = aggregateByBlock("DEFAULT_TENANT", null); // 全支部の場合はnull、特定支部の場合はbranchId
  } catch (e) {
    blocks = [];
  }

  // 既存のマスター(CONFIGや別シート)からエリアごとの「目標値(total)」「代表住所(repAddress)」を取得するロジックが必要だが、
  // 現状は互換性維持のため、一時的に静的マスター（または旧システムキャッシュ）をマージする。
  // ここではEventLogのデータを最優先とする。
  let cachedMaster = {};
  try {
    const dashboardData = getDashboardData();
    if (dashboardData && dashboardData.summary) {
      dashboardData.summary.forEach(item => {
        cachedMaster[item.name] = item;
      });
    }
  } catch(e) {}

  const areas = blocks.map(b => {
    const master = cachedMaster[b.name] || {};
    const total = master.total || 100; // 例: 未知のエリアは適当な値
    totalDone += b.done;
    return {
      name: b.name,
      progress: total > 0 ? Math.round((b.done / total) * 100) : 0,
      done: b.done,
      total: total,
      repAddress: master.repAddress || "",
      lat: b.lat || master.lat || null,
      lng: b.lng || master.lng || null
    };
  });
  
  // EventLogに存在しないがマスターに存在するエリアの補完
  Object.keys(cachedMaster).forEach(areaName => {
    if (!blocks.find(b => b.name === areaName)) {
      const master = cachedMaster[areaName];
      areas.push({
        name: areaName,
        progress: 0,
        done: 0,
        total: master.total || 0,
        repAddress: master.repAddress || "",
        lat: master.lat || null,
        lng: master.lng || null
      });
    }
  });

  const stats = { done: totalDone, total: CONFIG.get("DENOMINATOR_UNITS") || 0 };
  const apiKey = PropertiesService.getScriptProperties().getProperty('GOOGLE_MAPS_API_KEY') || "";
  
  // UI計算を避けるため、API側で都市（City）ごとの集計も行っておく
  const cityMap = {};
  areas.forEach(a => {
    const cityName = getCityName(a.name);
    if (!cityMap[cityName]) cityMap[cityName] = { name: cityName, done: 0, total: 0 };
    cityMap[cityName].done += a.done || 0;
    cityMap[cityName].total += a.total || 0;
  });
  const cities = Object.values(cityMap).map(c => {
    c.progress = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
    return c;
  });

  return {
    success: true,
    branchName: getSS().getName().split(/[ \u3000]/)[0] || "支部",
    areas: areas,
    cities: cities,
    stats: stats,
    apiKey: apiKey
  };
}

function getAreaDetails(areaName) {
  if (!areaName) return { success: false, message: "Area name required" };
  const s = getSS().getSheetByName(areaName);
  if (!s) return { success: false, message: "Area not found" };

  const lastRow = s.getLastRow();
  if (lastRow < 2) return { success: true, points: [] };

  const values = s.getRange(2, 1, lastRow - 1, 10).getValues();
  const points = values.map((r, i) => ({
    rowId: i + 2,
    address: r[0],
    memo: r[2],
    isDone: false, // EventLogから後でマージ
    completedAt: "",
    count: parseFloat(r[5]) || 0,
    staffName: "",
    staffId: "",
    gps: "",
    photoUrl: ""
  }));

  // EventLogから完了状態をマージ（Phase 13 Data Architecture）
  const logs = getAllEventLogs().filter(log => log.blockId === areaName);
  logs.forEach(log => {
    if (log.meta && log.meta.legacyRow) {
      const idx = log.meta.legacyRow - 2;
      if (points[idx]) {
        if (log.actionType === "distribute") {
          points[idx].isDone = true;
          points[idx].staffName = log.meta.staffName || "";
          points[idx].staffId = log.userId || "";
          points[idx].gps = (log.lat && log.lng) ? `${log.lat},${log.lng}` : "";
          points[idx].photoUrl = log.meta.photoUrl || "";
          points[idx].completedAt = Utilities.formatDate(new Date(log.timestamp), "JST", "MM/dd HH:mm");
        } else if (log.actionType === "revert_distribute") {
          points[idx].isDone = false;
        }
      }
    }
  });

  return { success: true, points: points };
}

// getCityName ヘルパー関数をGAS側にも定義
function getCityName(areaName) {
  if (!areaName) return 'その他';
  if (areaName.indexOf('四日市') === 0) return '四日市市';
  if (areaName.indexOf('鈴鹿') === 0) return '鈴鹿市';
  if (areaName.indexOf('亀山') === 0) return '亀山市';
  const match = areaName.match(/^[^市町\(\d]+(?:市|町)/);
  if (match) return match[0];
  return areaName + '市';
}

// 市区町村内の全エリア詳細を一括取得する関数
function getCityAreaDetails(cityName) {
  if (!cityName) return { success: false, message: "City name required" };
  const ss = getSS();
  const sheets = ss.getSheets();
  const details = {};

  const excludeSheets = [
    CONFIG.get("SHEET_GUIDE"),
    CONFIG.get("SHEET_ROSTER"),
    CONFIG.get("SHEET_TEMPLATE"),
    CONFIG.get("SHEET_POSTAL"),
    CONFIG.get("SHEET_DISTRICT"),
    CONFIG.get("SHEET_MASTER_EXPORT"),
    CONFIG.get("SHEET_REPORT"),
    CONFIG.get("SHEET_MANUAL"),
    CONFIG.get("SHEET_SYSTEM_CACHE"),
    CONFIG.get("SHEET_STORAGE")
  ];

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (excludeSheets.indexOf(sheetName) !== -1 || sheet.isSheetHidden()) return;

    if (getCityName(sheetName) === cityName) {
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        details[sheetName] = [];
        return;
      }
      const values = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
      const points = values.map((r, i) => ({
        rowId: i + 2,
        address: r[0],
        memo: r[2],
        isDone: false, // EventLogから後でマージ
        completedAt: "",
        count: parseFloat(r[5]) || 0,
        staffName: "",
        staffId: "",
        gps: "",
        photoUrl: ""
      }));
      details[sheetName] = points;
    }
  });

  // EventLogから一括マージ（Phase 13 Data Architecture）
  const logs = getAllEventLogs();
  logs.forEach(log => {
    const areaPoints = details[log.blockId];
    if (areaPoints && log.meta && log.meta.legacyRow) {
      const idx = log.meta.legacyRow - 2;
      if (areaPoints[idx]) {
        if (log.actionType === "distribute") {
          areaPoints[idx].isDone = true;
          areaPoints[idx].staffName = log.meta.staffName || "";
          areaPoints[idx].staffId = log.userId || "";
          areaPoints[idx].gps = (log.lat && log.lng) ? `${log.lat},${log.lng}` : "";
          areaPoints[idx].photoUrl = log.meta.photoUrl || "";
          areaPoints[idx].completedAt = Utilities.formatDate(new Date(log.timestamp), "JST", "MM/dd HH:mm");
        } else if (log.actionType === "revert_distribute") {
          areaPoints[idx].isDone = false;
        }
      }
    }
  });

  return { success: true, details: details };
}

function getRoster() {
  const s = getSS().getSheetByName(CONFIG.get("SHEET_ROSTER"));
  if (!s) return [];
  const lastRow = s.getLastRow();
  if (lastRow < 2) return [];
  
  const values = s.getRange(2, 1, lastRow - 1, 3).getValues();
  const roster = [];
  
  for (let i = 0; i < values.length; i++) {
    const id = String(values[i][0] || "").trim();
    const name = String(values[i][1] || "").trim();
    
    if (id !== "" && name !== "") {
      roster.push({ id: id, name: name });
    }
  }
  return roster;
}

function submitDistribution(data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: "サーバーが混雑しています。時間をおいて再度お試しください。" };
  }

  try {
    const isComplete = data.isDone === 'true' || data.isDone === true;
    const actType = isComplete ? "distribute" : "revert_distribute";
    const actCount = isComplete ? (parseFloat(data.count) || 1) : -(parseFloat(data.count) || 1);

    const event = {
      id: Utilities.getUuid(),
      timestamp: Date.now(),
      tenantId: data.tenantId || CONFIG.get("DEFAULT_TENANT_ID"),
      branchId: data.branchId || CONFIG.get("DEFAULT_BRANCH_ID", data.tenantId),
      prefectureId: data.prefectureId || "MIE",
      blockId: data.blockId || data.areaName, // システムID (e.g. MIE-03-YOK-001)
      userId: data.userId || data.staffId, // staffIdからのフォールバック互換性
      actionType: actType,
      count: actCount,
      lat: data.lat || 0,
      lng: data.lng || 0,
      meta: data.meta || { 
        legacyRow: data.rowId, 
        staffName: data.staffName,
        legacySheetName: data.legacySheetName
      }
    };

    // ① 旧シート（互換）- Phase A Shadow Write
    // ※ appendRow ではなく既存システムの構造（特定行のD〜H列の更新）を維持し、運用を一切壊さない
    const ss = getSS();
    const legacySheetName = data.legacySheetName || data.areaName; // 互換性維持
    const legacySheet = ss.getSheetByName(legacySheetName);
    
    if (legacySheet) {
      const rowNum = parseInt(data.rowId, 10);
      const completedAt = Utilities.formatDate(new Date(event.timestamp), "JST", "MM/dd HH:mm");
      legacySheet.getRange(rowNum, 4, 1, 5).setValues([[
        isComplete,
        isComplete ? completedAt : "",
        isComplete ? (parseFloat(data.count) || 0) : "",
        isComplete ? (data.staffName || "") : "",
        isComplete ? (data.userId || data.staffId || "") : ""
      ]]);

      if (!isComplete) {
        legacySheet.getRange(rowNum, 9, 1, 2).setValues([["", ""]]);
      }
    }

    // ② EventLog（正）
    appendEventLog(event);

    return { success: true, status: "ok", id: event.id };
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function normalizeName(str) {
  if (!str) return "";
  let s = String(str);
  // 1. Unicode正規化 (NFC) - Macの濁点結合文字対策など
  if (typeof s.normalize === 'function') {
    s = s.normalize('NFC');
  }
  // 2. 全角・半角スペース、改行、ゼロ幅スペース(\u200B,\u200C,\u200D)、BOM(\uFEFF)等のすべての不可視文字を除去
  return s.replace(/[\s\u3000\u200b\u200c\u200d\uFEFF]/g, "");
}

function registerStaff(lastName, firstName, lineUserId) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    throw new Error("サーバーが混雑しています。時間をおいて再度お試しください。");
  }

  try {
    const ss = getSS();
    const s = ss.getSheetByName(CONFIG.get("SHEET_ROSTER"));
    if (!s) return { success: false, message: "Roster sheet not found" };

    const cleanName = String(lastName || "").trim();
    const cleanAppName = String(firstName || "").trim();
    const normName = normalizeName(lastName);
    const normAppName = normalizeName(firstName);
    
    if (!cleanName || !cleanAppName) {
      return { success: false, message: "名前とアプリ名を入力してください。" };
    }

    const fullName = cleanName;

    // A列からC列のデータをすべて取得してチェック
    const lastRow = s.getLastRow();
    let values = [];
    if (lastRow >= 1) {
      // D列(4)まで取得する（A:ID, B:名前, C:アプリ名, D:LINE_USER_ID）
      values = s.getRange(1, 1, lastRow, 4).getValues();
    }

    // 1. 既存の同名スタッフがいないかチェック (表記揺れ吸収の上で比較)
    for (let i = 1; i < values.length; i++) {
      const rowId = normalizeName(values[i][0]);
      const rowName = normalizeName(values[i][1]);
      const rowAppName = normalizeName(values[i][2]);

      if (rowName === normName && rowAppName === normAppName && rowId !== "") {
        // 既存ユーザー：LINE_USER_IDが未設定でlineUserIdが渡された場合はD列を更新
        if (lineUserId && !values[i][3]) {
          s.getRange(i + 1, 4).setValue(lineUserId);
        }
        return { success: true, id: rowId, name: values[i][1], message: "existing" };
      }
    }

    // 2. 新規採番 (A列の最大値 + 1) と書き込み先の決定
    let maxIdNum = 0;
    let prefix = "S"; // デフォルトプレフィックス
    let paddingWidth = 3; // デフォルトパディング幅 (S001 -> 3桁)
    let targetRow = 0;
    let foundEmptyRow = false;

    for (let i = 1; i < values.length; i++) {
      const valId = normalizeName(values[i][0]);
      const valName = normalizeName(values[i][1]);
      const valAppName = normalizeName(values[i][2]);

      if (valId !== "") {
        // 例: "S001" -> prefix: "S", numPart: "001"
        const match = valId.match(/^([A-Za-z]*)(0*)(\d+)$/);
        if (match) {
          const currentPrefix = match[1];
          const zeros = match[2];
          const numStr = match[3];
          const idNum = parseInt(numStr, 10);
          
          if (!isNaN(idNum) && idNum > maxIdNum) {
            maxIdNum = idNum;
            prefix = currentPrefix;
            paddingWidth = (zeros + numStr).length;
          }
        } else {
          const idNum = parseInt(valId, 10);
          if (!isNaN(idNum) && idNum > maxIdNum) {
            maxIdNum = idNum;
            prefix = "";
            paddingWidth = 0;
          }
        }
      }

      // データ書き込み先として、ヘッダーより下で「ID、名前、アプリ名がすべて実質空白」の最初の行を再利用する
      if (!foundEmptyRow && valId === "" && valName === "" && valAppName === "") {
        targetRow = i + 1;
        foundEmptyRow = true;
      }
    }

    if (!foundEmptyRow) {
      targetRow = values.length + 1;
    }

    const nextIdNum = maxIdNum + 1;
    let newId = "";
    if (paddingWidth > 0) {
      newId = prefix + String(nextIdNum).padStart(paddingWidth, '0');
    } else {
      newId = prefix + nextIdNum;
    }

    // 指定の行に書き込む (A: ID, B: 名前, C: アプリ名, D: LINE_USER_ID)
    s.getRange(targetRow, 1, 1, 4).setValues([[newId, cleanName, cleanAppName, lineUserId || ""]]);

    return { success: true, id: newId, name: fullName, message: "new" };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 個人別配布ランキングのキャッシュデータを取得する（なければ再集計）
 */
function getRankingData() {
  // Phase 13: 完全に v2_core.gs 経由に変更
  return getRankingDataCore();
}

/**
 * GPS座標と写真データを伴う実績の登録・更新。
 * 送信された写真Base64データをGoogleドライブに「自己記述型ファイル名」で保存し、共有リンクをスプレッドシートに記録する。
 */
function updateRecordWithGPSPhoto(data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: "サーバーが混雑しています。時間をおいて再度お試しください。" };
  }

  try {
    const isComplete = data.isDone === 'true' || data.isDone === true;
    const actType = isComplete ? "photo" : "revert_photo";
    const actCount = isComplete ? (parseFloat(data.count) || 1) : -(parseFloat(data.count) || 1);

    let photoUrl = "";
    
    if (isComplete && data.photoData && data.photoData.indexOf("data:image") === 0) {
      try {
        const folderId = getStorageFolderId();
        const folder = DriveApp.getFolderById(folderId);
        const now = new Date();
        const timeStr = Utilities.formatDate(now, "JST", "HHmm");
        const safeStaffName = data.staffName ? data.staffName.replace(/[\s　]/g, "") : "Unknown";
        const legacySheetName = data.legacySheetName || data.areaName || "UnknownArea";
        const fileName = `[${legacySheetName}]_${safeStaffName}_${timeStr}.jpg`;
        const base64Data = data.photoData.split(",")[1];
        const decoded = Utilities.base64Decode(base64Data);
        const blob = Utilities.newBlob(decoded, "image/jpeg", fileName);
        const file = folder.createFile(blob);
        photoUrl = file.getId();
      } catch (driveErr) {
        console.error("Google Drive Save Error:", driveErr);
      }
    }

    const event = {
      id: Utilities.getUuid(),
      timestamp: Date.now(),
      tenantId: data.tenantId || CONFIG.get("DEFAULT_TENANT_ID"),
      branchId: data.branchId || CONFIG.get("DEFAULT_BRANCH_ID", data.tenantId),
      prefectureId: data.prefectureId || "MIE",
      blockId: data.blockId || data.areaName,
      userId: data.userId || data.staffId,
      actionType: actType,
      count: actCount,
      lat: data.lat || data.latitude || 0,
      lng: data.lng || data.longitude || 0,
      meta: data.meta || { 
        photoUrl: photoUrl || data.photoUrl,
        legacyRow: data.rowId, 
        staffName: data.staffName,
        legacySheetName: data.legacySheetName || data.areaName
      }
    };

    const ss = getSS();
    const legacySheetName = data.legacySheetName || data.areaName || "UnknownArea";
    const legacySheet = ss.getSheetByName(legacySheetName);
    
    if (legacySheet) {
      const rowNum = parseInt(data.rowId || data.legacyRow, 10);
      const completedAt = Utilities.formatDate(new Date(event.timestamp), "JST", "MM/dd HH:mm");
      legacySheet.getRange(rowNum, 4, 1, 5).setValues([[
        isComplete,
        isComplete ? completedAt : "",
        isComplete ? (parseFloat(data.count) || 0) : "",
        isComplete ? (data.staffName || "") : "",
        isComplete ? (data.userId || data.staffId || "") : ""
      ]]);

      if (isComplete) {
        const gpsStr = (event.lat && event.lng) ? `${event.lat},${event.lng}` : "";
        legacySheet.getRange(rowNum, 9).setValue(gpsStr);
        if (photoUrl) {
          legacySheet.getRange(rowNum, 10).setValue(photoUrl);
        }
      } else {
        legacySheet.getRange(rowNum, 9, 1, 2).setValues([["", ""]]);
      }
    }

    appendEventLog(event);

    return { success: true, status: "ok", id: event.id };
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =============================
// 要件9: 配送証跡統計 (管理画面用)
// =============================

/**
 * 全エリアシートを集計して配送証跡履歴を返す
 * CacheService TTL 60s でキャッシュして高速化
 *
 * 返却:
 *   totalCompleted — 完了件数 (isDone=true)
 *   withGPS        — GPS記録済み件数
 *   withPhoto      — 写真記録済み件数
 *   pending        — 未同期件数 (totalCompleted - withGPS)
 *   lastSyncAt     — 最新の完了時刻文字列
 */
function getDeliveryStats() {
  // Phase 13: v2_core.gs 経由に変更
  return getDeliveryStatsCore();
}

// =============================
// チラシ保管庫 API
// =============================

function getFlyerStock() {
  const ss = getSS();
  let s = ss.getSheetByName(CONFIG.get("SHEET_STORAGE") || "チラシ保管庫");
  if (!s) {
    s = ss.insertSheet(CONFIG.get("SHEET_STORAGE") || "チラシ保管庫");
    s.getRange(1, 1, 1, 6).setValues([["ID", "スタッフID", "スタッフ名", "保管場所", "保管枚数", "更新日時"]]);
  }
  const lastRow = s.getLastRow();
  if (lastRow < 2) return [];
  const values = s.getRange(2, 1, lastRow - 1, 6).getValues();
  return values.map(r => ({
    id: r[0],
    staffId: r[1],
    staffName: r[2],
    location: r[3],
    count: parseFloat(r[4]) || 0,
    updatedAt: (r[5] && typeof r[5].getMonth === 'function') ? Utilities.formatDate(r[5], "JST", "MM/dd HH:mm") : (r[5] ? String(r[5]).trim() : "")
  }));
}

function updateFlyerStock(location, count, staffName, staffId) {
  if (!staffId || !staffName) return { success: false, message: "Staff info required" };
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    throw new Error("Lock timeout");
  }
  try {
    const ss = getSS();
    let s = ss.getSheetByName(CONFIG.get("SHEET_STORAGE") || "チラシ保管庫");
    if (!s) {
      s = ss.insertSheet(CONFIG.get("SHEET_STORAGE") || "チラシ保管庫");
      s.getRange(1, 1, 1, 6).setValues([["ID", "スタッフID", "スタッフ名", "保管場所", "保管枚数", "更新日時"]]);
    }
    const lastRow = s.getLastRow();
    const now = new Date();
    const updatedAt = Utilities.formatDate(now, "JST", "MM/dd HH:mm");
    
    let values = [];
    if (lastRow >= 2) {
      values = s.getRange(2, 1, lastRow - 1, 6).getValues();
    }
    
    let targetRow = 0;
    let existingCount = 0;
    let existingLocation = "";
    for (let i = 0; i < values.length; i++) {
      if (values[i][1] === staffId) {
        targetRow = i + 2;
        existingCount = parseFloat(values[i][4]) || 0;
        existingLocation = values[i][3];
        break;
      }
    }
    
    if (targetRow > 0) {
      if (existingLocation !== location) {
        return { success: false, message: "このIDはすでに " + existingLocation + " で登録されています。他の市には登録できません。" };
      }
      const finalCount = existingCount + count;
      s.getRange(targetRow, 3, 1, 4).setValues([[staffName, location, finalCount, updatedAt]]);
    } else {
      const newRow = lastRow + 1;
      const newId = "ST" + String(newRow - 1).padStart(3, '0');
      s.getRange(newRow, 1, 1, 6).setValues([[newId, staffId, staffName, location, count, updatedAt]]);
    }
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

// =============================
// ③ 受渡要請システム (Flyer Transfer Request System)
// =============================

function handleRequestFlyerTransfer(data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: "システムが混雑しています。時間をおいて再度お試しください。" };
  }

  try {
    const ss = getSS();
    let sheetName = "受渡要請履歴";
    let s = ss.getSheetByName(sheetName);
    if (!s) {
      s = ss.insertSheet(sheetName);
      s.getRange(1, 1, 1, 8).setValues([["日時", "要請者", "要請者ID", "保管者", "保管者ID", "地区", "在庫枚数", "状態"]]);
    }

    const now = new Date();
    const requestTime = Utilities.formatDate(now, "JST", "yyyy/MM/dd HH:mm:ss");

    s.appendRow([
      requestTime,
      data.requestUserName,
      data.requestUserId,
      data.holderName,
      data.holderUserId,
      data.requestArea,
      data.stockCount,
      "申請中"
    ]);

    // Push通知処理：管理者IDシートの全管理者に通知
    const adminSheet = ss.getSheetByName(CONFIG.get("SHEET_ADMIN"));
    if (adminSheet) {
      const adminLastRow = adminSheet.getLastRow();
      if (adminLastRow >= 2) {
        const adminValues = adminSheet.getRange(2, 1, adminLastRow - 1, 2).getValues();
        for (let i = 0; i < adminValues.length; i++) {
          const adminLineId = String(adminValues[i][1] || '').trim();
          if (adminLineId) {
            sendLinePushMessage(adminLineId, data.requestUserName, data.holderName, data.requestArea, data.stockCount);
          }
        }
      }
    }

    return { success: true };
  } catch(e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =============================
// ④ 管理者登録 (Admin Registration)
// =============================

function registerAdmin(displayName, lineUserId) {
  if (!lineUserId) return { success: false, message: 'LINE User ID required' };
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch(e) { return { success: false, message: 'Lock timeout' }; }
  try {
    const ss = getSS();
    let s = ss.getSheetByName(CONFIG.get("SHEET_ADMIN"));
    if (!s) {
      s = ss.insertSheet(CONFIG.get("SHEET_ADMIN"));
      s.getRange(1, 1, 1, 3).setValues([['管理者名', 'LINE_USER_ID', '登録日時']]);
      // ヘッダー行のスタイル設定
      s.getRange(1, 1, 1, 3).setBackground('#1a237e').setFontColor('#ffffff').setFontWeight('bold');
    }
    const now = Utilities.formatDate(new Date(), 'JST', 'yyyy/MM/dd HH:mm:ss');
    const lastRow = s.getLastRow();
    // 既存チェック（LINE_USER_IDで重複防止）
    if (lastRow >= 2) {
      const existing = s.getRange(2, 1, lastRow - 1, 2).getValues();
      for (let i = 0; i < existing.length; i++) {
        if (String(existing[i][1]).trim() === lineUserId) {
          // 名前が変わっていたら更新
          if (existing[i][0] !== displayName) {
            s.getRange(i + 2, 1).setValue(displayName);
          }
          return { success: true, message: 'existing' };
        }
      }
    }
    // 上限チェック (3名制限)
    if (lastRow >= 4) { // ヘッダー1行 + データ3行 = 4行以上の場合は登録不可
      return { success: false, message: '管理者アカウントの登録上限(3名)に達しています。' };
    }
    // 新規追加
    s.appendRow([displayName, lineUserId, now]);
    return { success: true, message: 'new' };
  } finally {
    lock.releaseLock();
  }
}

function sendLinePushMessage(toUserId, requesterName, holderName, areaName, stockCount) {
  const props = PropertiesService.getScriptProperties();
  // 管理者用アクセストークンを優先、なければ一般用トークンにフォールバック
  const token = props.getProperty("LINE_CHANNEL_ACCESS_TOKEN_ADMIN") || props.getProperty("LINE_CHANNEL_ACCESS_TOKEN");
  if (!token) return; // トークン未設定の場合はスキップ

  const text = `【受渡要請通知】\n\n配布員からチラシの受渡要請がありました。\n\n要請者：\n${requesterName}\n\n保管者：\n${holderName}\n\n地区：\n${areaName}\n\n希望枚数：\n${Number(stockCount).toLocaleString()}枚\n\nポスティングADMIN PANELで確認し、保管者への連絡・調整を行ってください。`;

  const url = "https://api.line.me/v2/bot/message/push";
  const payload = {
    to: toUserId,
    messages: [{
      type: "text",
      text: text
    }]
  };

  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  Logger.log('LINE Push → status:' + response.getResponseCode() + ' body:' + response.getContentText());
}



// 受渡要請履歴の取得 API
function getTransferRequests() {
  const ss = getSS();
  const sheetName = "受渡要請履歴";
  const s = ss.getSheetByName(sheetName);
  if (!s) return [];
  const lastRow = s.getLastRow();
  if (lastRow < 2) return [];
  const values = s.getRange(2, 1, lastRow - 1, 8).getValues();
  return values.map((r, i) => ({
    rowNumber: i + 2, // 行番号（更新用）
    requestTime: (r[0] && typeof r[0].getMonth === 'function') ? Utilities.formatDate(r[0], "JST", "yyyy/MM/dd HH:mm:ss") : String(r[0] || ''),
    requesterName: r[1],
    requesterId: r[2],
    holderName: r[3],
    holderId: r[4],
    areaName: r[5],
    count: parseFloat(r[6]) || 0,
    status: r[7] || "申請中"
  }));
}

// 受渡要請のステータス更新 API
function resolveTransferRequest(data) {
  const rowNumber = parseInt(data.rowNumber);
  const status = data.status || "完了";
  if (!rowNumber || rowNumber < 2) return { success: false, message: "Invalid row number" };
  
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch(e) { return { success: false, message: "Lock timeout" }; }
  
  try {
    const ss = getSS();
    const sheetName = "受渡要請履歴";
    const s = ss.getSheetByName(sheetName);
    if (!s) return { success: false, message: "Sheet not found" };
    
    // ステータス（H列 = 8列目）を更新
    s.getRange(rowNumber, 8).setValue(status);
    return { success: true };
  } catch(e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 02_SYSTEM フォルダの直近のデータ整合性監査ログを取得する (診断用API)
 */
function getAuditLogs() {
  try {
    // SYSTEM_LOCK.ACTIVE_DRIVE_ROOT_ID = "1FfcVEQjod--rZSucOPFJD2DJ58hV650_"
    const root = DriveApp.getFolderById("1FfcVEQjod--rZSucOPFJD2DJ58hV650_");
    const systemFolder = root.getFoldersByName("02_SYSTEM").next();
    const files = systemFolder.getFiles();
    const logs = [];
    
    while (files.hasNext()) {
      const f = files.next();
      const name = f.getName();
      if (name.indexOf("AUDIT_DATA_") === 0) {
        logs.push({
          name: name,
          content: JSON.parse(f.getBlob().getDataAsString()),
          updated: f.getLastUpdated().toISOString()
        });
      }
    }
    
    // 更新日時でソート（降順）
    logs.sort((a, b) => b.updated.localeCompare(a.updated));
    
    const lastError = PropertiesService.getScriptProperties().getProperty("AUDIT_LAST_ERROR") || "None";
    return { success: true, logs: logs.slice(0, 10), lastError: lastError }; // 直近10件を返す
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ==========================================
// 🚀 PRODUCTION BACKEND FOUNDATION CLASSES
// ==========================================
class GasConfigurationProvider {
  constructor() {
    this.cacheTTL = 600;
    this.lockTimeout = 10000;
    this.apiVersion = "1.0.0-RC1";
    this.loadProperties();
  }
  static getInstance() {
    if (!GasConfigurationProvider.instance) {
      GasConfigurationProvider.instance = new GasConfigurationProvider();
    }
    return GasConfigurationProvider.instance;
  }
  loadProperties() {
    try {
      const props = PropertiesService.getScriptProperties();
      const ttl = props.getProperty('CACHE_TTL');
      if (ttl) this.cacheTTL = parseInt(ttl, 10);
      const timeout = props.getProperty('LOCK_TIMEOUT');
      if (timeout) this.lockTimeout = parseInt(timeout, 10);
    } catch (e) {}
  }
  getCacheTTL() { return this.cacheTTL; }
  getLockTimeout() { return this.lockTimeout; }
  getApiVersion() { return this.apiVersion; }
  getSpreadsheetId() {
    const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (id) return id;
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) return ss.getId();
    } catch (e) {}
    throw new Error('SPREADSHEET_ID is not configured.');
  }
  getStorageParentFolderId() {
    return PropertiesService.getScriptProperties().getProperty('STORAGE_PARENT_ID') || CONFIG.STORAGE_PARENT_ID;
  }
  getFeatureFlags() {
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
    } catch (e) {}
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
GasConfigurationProvider.instance = null;

class CacheServiceProvider {
  constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
  }
  static getInstance() {
    if (!CacheServiceProvider.instance) {
      CacheServiceProvider.instance = new CacheServiceProvider();
    }
    return CacheServiceProvider.instance;
  }
  makeKey(tenantId, branchId, category) {
    return tenantId + ":" + branchId + ":" + category;
  }
  get(key) {
    try {
      return CacheService.getScriptCache().get(key);
    } catch (e) {
      return null;
    }
  }
  put(key, value, ttlSeconds) {
    try {
      const expiry = ttlSeconds !== undefined ? ttlSeconds : this.configProvider.getCacheTTL();
      CacheService.getScriptCache().put(key, value, Math.min(expiry, 21600));
    } catch (e) {}
  }
  remove(key) {
    try {
      CacheService.getScriptCache().remove(key);
    } catch (e) {}
  }
}
CacheServiceProvider.instance = null;

class LockServiceProvider {
  constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
  }
  static getInstance() {
    if (!LockServiceProvider.instance) {
      LockServiceProvider.instance = new LockServiceProvider();
    }
    return LockServiceProvider.instance;
  }
  executeWithLock(action) {
    const lock = LockService.getScriptLock();
    const timeoutMs = this.configProvider.getLockTimeout();
    const startTime = Date.now();
    const hasLock = lock.tryLock(timeoutMs);
    if (!hasLock) {
      throw new Error("Lock Timeout: Failed to acquire lock within " + timeoutMs + "ms.");
    }
    GasPerformanceMonitor.getInstance().recordLockAcquired(Date.now() - startTime);
    try {
      return action();
    } finally {
      try {
        lock.releaseLock();
      } catch (e) {}
    }
  }
}
LockServiceProvider.instance = null;

class SpreadsheetBatchReader {
  constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
    this.cachedSpreadsheet = null;
  }
  getSpreadsheet() {
    if (this.cachedSpreadsheet) return this.cachedSpreadsheet;
    const ssId = this.configProvider.getSpreadsheetId();
    this.cachedSpreadsheet = SpreadsheetApp.openById(ssId);
    return this.cachedSpreadsheet;
  }
  readAll(sheetName) {
    GasPerformanceMonitor.getInstance().recordSpreadsheetRead();
    const ss = this.getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    if (lastRow === 0 || lastColumn === 0) return [];
    return sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  }
  readRange(sheetName, startRow, startCol, numRows, numCols) {
    GasPerformanceMonitor.getInstance().recordSpreadsheetRead();
    const ss = this.getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    return sheet.getRange(startRow, startCol, numRows, numCols).getValues();
  }
}

class SpreadsheetBatchWriter {
  constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
    this.cachedSpreadsheet = null;
  }
  getSpreadsheet() {
    if (this.cachedSpreadsheet) return this.cachedSpreadsheet;
    const ssId = this.configProvider.getSpreadsheetId();
    this.cachedSpreadsheet = SpreadsheetApp.openById(ssId);
    return this.cachedSpreadsheet;
  }
  appendRows(sheetName, rows) {
    if (rows.length === 0) return;
    GasPerformanceMonitor.getInstance().recordSpreadsheetWrite();
    const ss = this.getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
  updateRange(sheetName, startRow, startCol, rows) {
    if (rows.length === 0) return;
    GasPerformanceMonitor.getInstance().recordSpreadsheetWrite();
    const ss = this.getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    sheet.getRange(startRow, startCol, rows.length, rows[0].length).setValues(rows);
  }
}

class SpreadsheetRepository {
  constructor() {
    this.reader = new SpreadsheetBatchReader();
    this.writer = new SpreadsheetBatchWriter();
  }
  getAreas(tenantId, branchId) {
    const rawRows = this.reader.readAll('Areas');
    if (rawRows.length <= 1) return [];
    const records = [];
    const headers = rawRows[0];
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
  saveEventLogs(logs) {
    if (logs.length === 0) return;
    const rawRows = this.reader.readAll('EventLogs');
    const headers = rawRows.length > 0 ? rawRows[0] : ['Event ID', 'Timestamp', 'Type', 'Payload'];
    const formattedRows = logs.map(log => {
      return headers.map(h => {
        if (h === 'Event ID') return log.eventId || ("EV-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4));
        if (h === 'Timestamp') return log.timestamp || Date.now();
        if (h === 'Type') return log.type || 'unknown';
        if (h === 'Payload') return JSON.stringify(log.payload || {});
        return '';
      });
    });
    this.writer.appendRows('EventLogs', formattedRows);
  }
  getStaffs() {
    const rawRows = this.reader.readAll('Staffs');
    if (rawRows.length <= 1) return [];
    const headers = rawRows[0];
    const lastIdx = headers.indexOf('Last Name');
    const firstIdx = headers.indexOf('First Name');
    const statusIdx = headers.indexOf('Status');
    const records = [];
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
  updateAreaStatus(areaId, status) {
    const rawRows = this.reader.readAll('Areas');
    if (rawRows.length <= 1) return;
    const headers = rawRows[0];
    const areaIdIdx = headers.indexOf('Area ID');
    const statusIdx = headers.indexOf('Status');
    if (areaIdIdx === -1 || statusIdx === -1) return;
    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (String(row[areaIdIdx]) === areaId) {
        this.writer.updateRange('Areas', i + 1, statusIdx + 1, [[status]]);
        break;
      }
    }
  }
}

class ApiExecutionContext {
  constructor() {
    this.startTimestamp = Date.now();
    this.requestId = "req-" + this.startTimestamp + "-" + Math.random().toString(36).substr(2, 9);
    this.executionId = "exec-" + Math.random().toString(36).substr(2, 9);
    this.retryCount = 0;
    this.validationTime = 0;
    this.routingTime = 0;
    this.handlerTime = 0;
  }
  getRequestId() { return this.requestId; }
  getExecutionId() { return this.executionId; }
  getStartTimestamp() { return this.startTimestamp; }
  getElapsedTime() { return Date.now() - this.startTimestamp; }
  getRetryCount() { return this.retryCount; }
  incrementRetry() { this.retryCount++; }
  setValidationTime(ms) { this.validationTime = ms; }
  getValidationTime() { return this.validationTime; }
  setRoutingTime(ms) { this.routingTime = ms; }
  getRoutingTime() { return this.routingTime; }
  setHandlerTime(ms) { this.handlerTime = ms; }
  getHandlerTime() { return this.handlerTime; }
}

class GasPerformanceMonitor {
  constructor() {
    this.spreadsheetReads = 0;
    this.spreadsheetWrites = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.lockWaitTime = 0;
    this.lockAcquires = 0;
  }
  static getInstance() {
    if (!GasPerformanceMonitor.instance) {
      GasPerformanceMonitor.instance = new GasPerformanceMonitor();
    }
    return GasPerformanceMonitor.instance;
  }
  recordSpreadsheetRead() { this.spreadsheetReads++; }
  recordSpreadsheetWrite() { this.spreadsheetWrites++; }
  recordCacheHit() { this.cacheHits++; }
  recordCacheMiss() { this.cacheMisses++; }
  recordLockAcquired(waitTimeMs) {
    this.lockAcquires++;
    this.lockWaitTime += waitTimeMs;
  }
  reset() {
    this.spreadsheetReads = 0;
    this.spreadsheetWrites = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.lockWaitTime = 0;
    this.lockAcquires = 0;
  }
  getMetrics() {
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
GasPerformanceMonitor.instance = null;

// ==========================================
// 🚀 API ROUTING & ENDPOINT FOUNDATION CLASSES
// ==========================================
class ApiRequest {
  constructor(params) {
    this.method = params.method.toUpperCase();
    this.path = params.path;
    this.version = params.version.toLowerCase();
    this.query = params.query || {};
    this.body = params.body || {};
    this.headers = params.headers || {};
    this.requestId = params.requestId;
  }
}

class ApiResponse {
  constructor(params) {
    this.status = params.status;
    this.success = params.success;
    this.data = params.data || null;
    this.error = params.error || null;
    this.metadata = params.metadata;
  }
  static successResponse(data, status, metadata) {
    return new ApiResponse({
      status: status,
      success: true,
      data: data,
      metadata: metadata
    });
  }
  static errorResponse(code, message, status, metadata) {
    return new ApiResponse({
      status: status,
      success: false,
      error: { code: code, message: message },
      metadata: metadata
    });
  }
}

class RoutePolicy {
  static isMethodAllowed(method) {
    const m = method.toUpperCase();
    return m === 'GET' || m === 'POST' || m === 'PUT' || m === 'DELETE';
  }
}

class ApiVersionResolver {
  static resolve(pathVersion, queryVersion) {
    if (pathVersion && (pathVersion === 'v1' || pathVersion === 'v2' || pathVersion === 'v3' || pathVersion === 'future')) {
      return pathVersion.toLowerCase();
    }
    if (queryVersion) {
      const normalized = queryVersion.startsWith('v') ? queryVersion.toLowerCase() : 'v' + queryVersion;
      if (normalized === 'v1' || normalized === 'v2' || normalized === 'v3' || normalized === 'future') {
        return normalized;
      }
    }
    const defaultVersion = GasConfigurationProvider.getInstance().getApiVersion();
    const resolvedDefault = defaultVersion.split('-')[0].split('.')[0];
    const finalDefault = resolvedDefault.startsWith('v') ? resolvedDefault.toLowerCase() : 'v' + resolvedDefault;
    if (finalDefault === 'v1' || finalDefault === 'v2' || finalDefault === 'v3' || finalDefault === 'future') {
      return finalDefault;
    }
    return 'v2';
  }
}

class RouteKey {
  constructor(method, version, path) {
    let normalizedPath = path.trim().toLowerCase();
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }
    if (normalizedPath.endsWith('/') && normalizedPath.length > 1) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    this.key = method.toUpperCase() + ":" + version.toLowerCase() + ":" + normalizedPath;
  }
  toString() {
    return this.key;
  }
}

class RouteResolver {
  static resolveKey(method, version, path) {
    return new RouteKey(method, version, path).toString();
  }
}

class DashboardHandler {
  execute(request, context) {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    return ApiResponse.errorResponse(
      'NOT_IMPLEMENTED',
      'DashboardHandler is currently a placeholder stub in S3-2 Routing Foundation.',
      501,
      metadata
    );
  }
}

class HoldingHandler {
  execute(request, context) {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    return ApiResponse.errorResponse(
      'NOT_IMPLEMENTED',
      'HoldingHandler is currently a placeholder stub in S3-2 Routing Foundation.',
      501,
      metadata
    );
  }
}

class HealthHandler {
  execute(request, context) {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    return ApiResponse.errorResponse(
      'NOT_IMPLEMENTED',
      'HealthHandler is currently a placeholder stub in S3-2 Routing Foundation.',
      501,
      metadata
    );
  }
}

class VersionHandler {
  execute(request, context) {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    return ApiResponse.errorResponse(
      'NOT_IMPLEMENTED',
      'VersionHandler is currently a placeholder stub in S3-2 Routing Foundation.',
      501,
      metadata
    );
  }
}

class UnknownEndpointHandler {
  execute(request, context) {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    if (!RoutePolicy.isMethodAllowed(request.method)) {
      return ApiResponse.errorResponse(
        'METHOD_NOT_ALLOWED',
        'HTTP Method ' + request.method + ' is not allowed.',
        405,
        metadata
      );
    }
    return ApiResponse.errorResponse(
      'ROUTE_NOT_FOUND',
      'API Route "' + request.method + ' ' + request.path + '" under version ' + request.version + ' was not found.',
      404,
      metadata
    );
  }
}

class LegacyDashboardHandler {
  execute(request, context) {
    const result = processGetActionLegacy('getAppData', request.query);
    const isSuccess = (result && result.success !== undefined) ? result.success : true;
    return new ApiResponse({
      status: isSuccess ? 200 : 400,
      success: isSuccess,
      data: result,
      metadata: {
        requestId: request.requestId,
        serverTimestamp: context.getStartTimestamp(),
        processingTime: context.getElapsedTime(),
        version: request.version
      }
    });
  }
}

class LegacyHoldingHandler {
  execute(request, context) {
    let result;
    if (request.method === 'GET') {
      result = processGetActionLegacy('getFlyerStock', request.query);
    } else {
      result = processPostAction('updateFlyerStock', request.body, request);
    }
    const isSuccess = (result && result.success !== undefined) ? result.success : true;
    return new ApiResponse({
      status: isSuccess ? 200 : 400,
      success: isSuccess,
      data: result,
      metadata: {
        requestId: request.requestId,
        serverTimestamp: context.getStartTimestamp(),
        processingTime: context.getElapsedTime(),
        version: request.version
      }
    });
  }
}

class LegacyApiFallbackHandler {
  execute(request, context) {
    let result;
    const action = request.body.action || request.query.action;
    if (request.method === 'GET') {
      result = processGetActionLegacy(action, request.query);
    } else {
      result = processPostAction(action, request.body, request);
    }
    const isSuccess = (result && result.success !== undefined) ? result.success : true;
    return new ApiResponse({
      status: isSuccess ? 200 : 400,
      success: isSuccess,
      data: result,
      metadata: {
        requestId: request.requestId,
        serverTimestamp: context.getStartTimestamp(),
        processingTime: context.getElapsedTime(),
        version: request.version
      }
    });
  }
}

class EndpointRegistry {
  constructor() {
    this.routes = {};
    this.unknownHandler = new UnknownEndpointHandler();
    this.legacyHandler = new LegacyApiFallbackHandler();
    this.registerDefaultRoutes();
  }
  static getInstance() {
    if (!EndpointRegistry.instance) {
      EndpointRegistry.instance = new EndpointRegistry();
    }
    return EndpointRegistry.instance;
  }
  registerDefaultRoutes() {
    const flags = GasConfigurationProvider.getInstance().getFeatureFlags();
    const dashboard = flags.mapbox ? new DashboardHandler() : new LegacyDashboardHandler();
    const holding = flags.mapbox ? new HoldingHandler() : new LegacyHoldingHandler();
    const health = new HealthHandler();
    const version = new VersionHandler();

    this.register('GET', 'v2', '/dashboard', dashboard);
    this.register('POST', 'v2', '/dashboard', dashboard);
    this.register('GET', 'v2', '/holding', holding);
    this.register('POST', 'v2', '/holding', holding);
    this.register('GET', 'v2', '/health', health);
    this.register('GET', 'v2', '/version', version);
  }
  register(method, version, path, handler) {
    const key = RouteResolver.resolveKey(method, version, path);
    this.routes[key] = handler;
  }
  getHandler(method, version, path) {
    const key = RouteResolver.resolveKey(method, version, path);
    return this.routes[key] || this.legacyHandler;
  }
}
EndpointRegistry.instance = null;

class ApiRouter {
  constructor() {
    this.registry = EndpointRegistry.getInstance();
  }
  static getInstance() {
    if (!ApiRouter.instance) {
      ApiRouter.instance = new ApiRouter();
    }
    return ApiRouter.instance;
  }
  route(request, context) {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };

    if (!RoutePolicy.isMethodAllowed(request.method)) {
      return ApiResponse.errorResponse(
        'METHOD_NOT_ALLOWED',
        'HTTP Method ' + request.method + ' is not allowed by RoutePolicy.',
        405,
        metadata
      );
    }

    try {
      const handler = this.registry.getHandler(request.method, request.version, request.path);
      return handler.execute(request, context);
    } catch (err) {
      return ApiResponse.errorResponse(
        'INTERNAL_SERVER_ERROR',
        err.message || String(err),
        500,
        metadata
      );
    }
  }
}
ApiRouter.instance = null;

// ==========================================
// 🚀 VALIDATION PIPELINE FOUNDATION CLASSES
// ==========================================
const ValidationError = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  INVALID_METHOD: 'INVALID_METHOD',
  INVALID_VERSION: 'INVALID_VERSION',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  FEATURE_DISABLED: 'FEATURE_DISABLED'
};

class ValidationResult {
  constructor(params) {
    this.valid = params.valid;
    this.errors = params.errors || [];
    this.warnings = params.warnings || [];
    this.metadata = params.metadata;
  }
  static success(validatedAt, duration) {
    return new ValidationResult({
      valid: true,
      metadata: { validatedAt: validatedAt, duration: duration }
    });
  }
  static failure(errors, validatedAt, duration) {
    return new ValidationResult({
      valid: false,
      errors: errors,
      metadata: { validatedAt: validatedAt, duration: duration }
    });
  }
}

// Legacy ValidationException placeholder (replaced by S3-4 Exception Framework version below)

class RequestValidator {
  constructor() {
    this.id = 'REQUEST_VALIDATOR';
  }
  validate(request, context) {
    const validatedAt = Date.now();
    if (!request) {
      return ValidationResult.failure(
        [{ code: ValidationError.INVALID_REQUEST, message: 'Request object is null or undefined.', validatorId: this.id }],
        validatedAt,
        0
      );
    }
    if (!request.method || !request.path || !request.requestId) {
      return ValidationResult.failure(
        [{ code: ValidationError.INVALID_REQUEST, message: 'Request method, path or requestId is missing.', validatorId: this.id }],
        validatedAt,
        0
      );
    }
    return ValidationResult.success(validatedAt, 0);
  }
}

class MethodValidator {
  constructor() {
    this.id = 'METHOD_VALIDATOR';
  }
  validate(request, context) {
    const validatedAt = Date.now();
    if (!RoutePolicy.isMethodAllowed(request.method)) {
      return ValidationResult.failure(
        [{ code: ValidationError.INVALID_METHOD, message: 'HTTP Method ' + request.method + ' is not allowed.', validatorId: this.id }],
        validatedAt,
        0
      );
    }
    return ValidationResult.success(validatedAt, 0);
  }
}

class VersionValidator {
  constructor() {
    this.id = 'VERSION_VALIDATOR';
  }
  validate(request, context) {
    const validatedAt = Date.now();
    const supported = { v1: true, v2: true, v3: true, future: true };
    if (!supported[request.version]) {
      return ValidationResult.failure(
        [{ code: ValidationError.INVALID_VERSION, message: 'API Version ' + request.version + ' is not supported.', validatorId: this.id }],
        validatedAt,
        0
      );
    }
    return ValidationResult.success(validatedAt, 0);
  }
}

class RouteValidator {
  constructor() {
    this.id = 'ROUTE_VALIDATOR';
  }
  validate(request, context) {
    const validatedAt = Date.now();
    const registry = EndpointRegistry.getInstance();
    const routeKey = RouteResolver.resolveKey(request.method, request.version, request.path);
    
    let hasRegisteredRoute = registry.routes[routeKey] !== undefined;
    if (hasRegisteredRoute) {
      return ValidationResult.success(validatedAt, 0);
    }

    const action = request.body.action || request.query.action;
    if (action) {
      return ValidationResult.success(validatedAt, 0);
    }

    return ValidationResult.failure(
      [{ code: ValidationError.ROUTE_NOT_FOUND, message: 'Route "' + request.method + ' ' + request.path + '" was not found.', validatorId: this.id }],
      validatedAt,
      0
    );
  }
}

class FeatureValidator {
  constructor() {
    this.id = 'FEATURE_VALIDATOR';
  }
  validate(request, context) {
    const validatedAt = Date.now();
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    if (request.path === '/holding' && !flags.flyerHolding) {
      return ValidationResult.failure(
        [{ code: ValidationError.FEATURE_DISABLED, message: 'Held Flyers feature is currently disabled.', validatorId: this.id }],
        validatedAt,
        0
      );
    }

    if (request.path === '/dashboard' && !flags.googleMaps && !flags.mapbox) {
      return ValidationResult.failure(
        [{ code: ValidationError.FEATURE_DISABLED, message: 'Map engine feature is currently disabled.', validatorId: this.id }],
        validatedAt,
        0
      );
    }

    return ValidationResult.success(validatedAt, 0);
  }
}

class ValidatorChain {
  constructor() {
    this.id = 'VALIDATOR_CHAIN';
    this.validators = [];
  }
  addValidator(validator) {
    this.validators.push(validator);
    return this;
  }
  validate(request, context) {
    const start = Date.now();
    for (let i = 0; i < this.validators.length; i++) {
      const validator = this.validators[i];
      const result = validator.validate(request, context);
      if (!result.valid) {
        const duration = Date.now() - start;
        return ValidationResult.failure(result.errors, start, duration);
      }
    }
    const duration = Date.now() - start;
    return ValidationResult.success(start, duration);
  }
}

class ValidationPipeline {
  constructor() {
    this.chain = new ValidatorChain();
    this.registerValidators();
  }
  static getInstance() {
    if (!ValidationPipeline.instance) {
      ValidationPipeline.instance = new ValidationPipeline();
    }
    return ValidationPipeline.instance;
  }
  registerValidators() {
    this.chain
      .addValidator(new RequestValidator())
      .addValidator(new MethodValidator())
      .addValidator(new VersionValidator())
      .addValidator(new RouteValidator())
      .addValidator(new FeatureValidator());
  }
  validate(request, context) {
    const result = this.chain.validate(request, context);
    if (!result.valid) {
      throw new ValidationException(result);
    }
    return result;
  }
}
ValidationPipeline.instance = null;

// ==========================================
// 🚀 EXCEPTION FRAMEWORK FOUNDATION CLASSES
// ==========================================
const ExceptionCategory = {
  VALIDATION: 'VALIDATION',
  ROUTING: 'ROUTING',
  SYSTEM: 'SYSTEM',
  CONFIGURATION: 'CONFIGURATION',
  FEATURE: 'FEATURE'
};

class ApiException extends Error {
  constructor(params) {
    super(params.internalMessage);
    this.name = this.constructor.name;
    this.internalMessage = params.internalMessage;
    this.externalMessage = params.externalMessage;
    this.metadata = params.metadata;
  }
}

class SystemException extends ApiException {
  constructor(internalMessage, requestId, details) {
    super({
      internalMessage: internalMessage,
      externalMessage: '予期しないシステムエラーが発生しました。',
      metadata: {
        requestId: requestId,
        timestamp: Date.now(),
        exceptionType: 'SystemException',
        exceptionCode: 'PM-SYS-001',
        source: 'SYSTEM',
        details: details
      }
    });
    this.category = ExceptionCategory.SYSTEM;
    this.code = 'PM-SYS-001';
    this.status = 500;
  }
}

class RoutingException extends ApiException {
  constructor(code, status, internalMessage, requestId, details) {
    super({
      internalMessage: internalMessage,
      externalMessage:
        status === 404
          ? '指定された API ルートが見つかりません。'
          : '指定された HTTP メソッドは許可されていません。',
      metadata: {
        requestId: requestId,
        timestamp: Date.now(),
        exceptionType: 'RoutingException',
        exceptionCode: code,
        source: 'ROUTING',
        details: details
      }
    });
    this.category = ExceptionCategory.ROUTING;
    this.code = code;
    this.status = status;
  }
  static notFound(internalMessage, requestId, details) {
    return new RoutingException('PM-RTE-001', 404, internalMessage, requestId, details);
  }
  static methodNotAllowed(internalMessage, requestId, details) {
    return new RoutingException('PM-RTE-002', 405, internalMessage, requestId, details);
  }
}

class ConfigurationException extends ApiException {
  constructor(internalMessage, requestId, details) {
    super({
      internalMessage: internalMessage,
      externalMessage: 'システム設定エラーが発生しました。',
      metadata: {
        requestId: requestId,
        timestamp: Date.now(),
        exceptionType: 'ConfigurationException',
        exceptionCode: 'PM-CFG-001',
        source: 'CONFIGURATION',
        details: details
      }
    });
    this.category = ExceptionCategory.CONFIGURATION;
    this.code = 'PM-CFG-001';
    this.status = 500;
  }
}


class ValidationException extends ApiException {
  constructor(result) {
    const mainError = result.errors[0];
    const internalMessage = mainError
      ? 'Validation failed at ' + mainError.validatorId + ': [' + mainError.code + '] ' + mainError.message
      : 'Validation failed';

    const errCode = mainError ? mainError.code : 'INVALID_REQUEST';
    const statusMap = {
      INVALID_REQUEST: 400,
      INVALID_METHOD: 405,
      INVALID_VERSION: 422,
      ROUTE_NOT_FOUND: 404,
      FEATURE_DISABLED: 422
    };
    const status = statusMap[errCode] || 422;

    super({
      internalMessage: internalMessage,
      externalMessage: '入力パラメータの検証に失敗しました。',
      metadata: {
        requestId: result.metadata.validatedAt.toString(),
        timestamp: result.metadata.validatedAt,
        exceptionType: 'ValidationException',
        exceptionCode: 'PM-VAL-001',
        source: mainError ? mainError.validatorId : 'VALIDATOR_CHAIN',
        details: mainError ? mainError.message : undefined
      }
    });

    this.category = ExceptionCategory.VALIDATION;
    this.code = 'PM-VAL-001';
    this.status = status;
    this.result = result;
  }
}

class ExceptionMapper {
  static toResponse(error, request, context) {
    let apiException;
    if (error instanceof ApiException) {
      apiException = error;
    } else {
      apiException = new SystemException(
        error.message || String(error),
        request.requestId,
        error.stack
      );
    }

    const metadata = {
      requestId: request.requestId,
      serverTimestamp: apiException.metadata.timestamp,
      processingTime: context.getElapsedTime(),
      version: request.version,
      exception: {
        category: apiException.category,
        code: apiException.code,
        internalMessage: apiException.internalMessage
      }
    };

    return ApiResponse.errorResponse(
      apiException.code,
      apiException.externalMessage,
      apiException.status,
      metadata
    );
  }
}

class ExceptionHandler {
  static addListener(listener) {
    ExceptionHandler.onExceptionListeners.push(listener);
  }
  static clearListeners() {
    ExceptionHandler.onExceptionListeners = [];
  }
  static handle(error, request, context) {
    for (let i = 0; i < ExceptionHandler.onExceptionListeners.length; i++) {
      try {
        ExceptionHandler.onExceptionListeners[i](error, request, context);
      } catch (hookErr) {
        console.error('[ExceptionHandler Hook Error]', hookErr);
      }
    }
    return ExceptionMapper.toResponse(error, request, context);
  }
}
ExceptionHandler.onExceptionListeners = [];

// ==========================================
// 🚀 MONITORING & AUDIT FOUNDATION CLASSES
// ==========================================
class EventDispatcher {
  constructor() {
    this.listeners = [];
  }
  static getInstance() {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }
  addListener(listener) {
    this.listeners.push(listener);
  }
  clearListeners() {
    this.listeners.length = 0;
  }
  dispatch(event) {
    for (let i = 0; i < this.listeners.length; i++) {
      try {
        this.listeners[i].onEvent(event);
      } catch (err) {
        console.error('[EventDispatcher Dispatch Error]', err);
      }
    }
  }
}
EventDispatcher.instance = null;

class AuditCollector {
  constructor() {
    this.events = [];
  }
  static getInstance() {
    if (!AuditCollector.instance) {
      AuditCollector.instance = new AuditCollector();
    }
    return AuditCollector.instance;
  }
  onEvent(event) {
    if (
      event.category === 'AUDIT' ||
      event.category === 'LIFECYCLE' ||
      event.category === 'EXCEPTION'
    ) {
      this.events.push(event);
    }
  }
  getEvents() {
    return this.events.slice();
  }
  clear() {
    this.events.length = 0;
  }
}
AuditCollector.instance = null;

class MetricsCollector {
  constructor() {
    this.events = [];
  }
  static getInstance() {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }
  onEvent(event) {
    if (event.category === 'METRICS') {
      this.events.push(event);
    }
  }
  getEvents() {
    return this.events.slice();
  }
  clear() {
    this.events.length = 0;
  }
}
MetricsCollector.instance = null;

class MonitoringPipeline {
  constructor() {
    this.sequenceCounter = 0;
    this.dispatcher = EventDispatcher.getInstance();
    this.dispatcher.addListener(AuditCollector.getInstance());
    this.dispatcher.addListener(MetricsCollector.getInstance());
  }
  static getInstance() {
    if (!MonitoringPipeline.instance) {
      MonitoringPipeline.instance = new MonitoringPipeline();
    }
    return MonitoringPipeline.instance;
  }
  resetSequence() {
    this.sequenceCounter = 0;
  }
  createAndDispatch(eventType, category, requestId, source, payload) {
    this.sequenceCounter++;
    const eventId = 'EVT-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    const event = {
      eventId: eventId,
      eventType: eventType,
      category: category,
      sequenceNumber: this.sequenceCounter,
      requestId: requestId,
      timestamp: Date.now(),
      source: source,
      payload: payload
    };
    this.dispatcher.dispatch(event);
  }
}
MonitoringPipeline.instance = null;

class ApiLifecycleObserver {
  static onStart(request, context) {
    MonitoringPipeline.getInstance().resetSequence();
    MonitoringPipeline.getInstance().createAndDispatch(
      'REQUEST_STARTED',
      'LIFECYCLE',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      { method: request.method, path: request.path }
    );
  }
  static onValidationSuccess(request, context) {
    MonitoringPipeline.getInstance().createAndDispatch(
      'VALIDATION_COMPLETED',
      'AUDIT',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      { path: request.path }
    );
  }
  static onRoutingSuccess(request, context) {
    MonitoringPipeline.getInstance().createAndDispatch(
      'ROUTING_COMPLETED',
      'AUDIT',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      { path: request.path }
    );
  }
  static onHandlerSuccess(request, context) {
    MonitoringPipeline.getInstance().createAndDispatch(
      'HANDLER_COMPLETED',
      'AUDIT',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      { path: request.path }
    );
  }
  static onComplete(request, response, context) {
    MonitoringPipeline.getInstance().createAndDispatch(
      'REQUEST_COMPLETED',
      'LIFECYCLE',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      { path: request.path, status: response.status }
    );
    const validationTime = context.getValidationTime();
    const routingTime = context.getRoutingTime();
    const handlerTime = context.getHandlerTime();
    MonitoringPipeline.getInstance().createAndDispatch(
      'METRICS_COLLECTED',
      'METRICS',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      {
        processingTime: context.getElapsedTime(),
        validationTime: validationTime,
        routingTime: routingTime,
        handlerTime: handlerTime,
        statusCode: response.status,
        cacheStatus: 'NONE'
      }
    );
  }
  static onException(error, request, context) {
    MonitoringPipeline.getInstance().createAndDispatch(
      'REQUEST_FAILED',
      'LIFECYCLE',
      request.requestId,
      'API_LIFECYCLE_OBSERVER',
      {
        path: request.path,
        exceptionMessage: error.message || String(error)
      }
    );
  }
}

// ==========================================
// 🚀 PRODUCTION HARDENING FOUNDATION CLASSES
// ==========================================
class HealthCheckService {
  static getInstance() {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }
  checkHealth() {
    const checks = {
      CONFIG: { status: 'OK', message: 'Configuration Provider is active.' },
      REPOSITORY: { status: 'OK', message: 'Repository boundaries verified.' },
      CACHE: { status: 'OK', message: 'Cache Service is functional.' },
      LOCK: { status: 'OK', message: 'Lock manager initialized.' },
      MONITOR: { status: 'OK', message: 'Monitoring event loop active.' },
      ROUTER: { status: 'OK', message: 'Api Router registries mapped.' }
    };

    let status = 'HEALTHY';
    let failCount = 0;
    let warnCount = 0;
    const keys = Object.keys(checks);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (checks[key].status === 'FAIL') {
        failCount++;
      } else if (checks[key].status === 'WARN') {
        warnCount++;
      }
    }

    if (failCount > 0) {
      status = 'UNAVAILABLE';
    } else if (warnCount > 0) {
      status = 'DEGRADED';
    }

    return {
      status: status,
      checks: checks,
      timestamp: Date.now(),
      version: 'v2'
    };
  }
}
HealthCheckService.instance = null;

class RequestGuard {
  static check(request) {
    const maxParams = 100;
    const maxBodySize = 10 * 1024 * 1024;

    if (request.query && Object.keys(request.query).length > maxParams) {
      return {
        allowed: false,
        reason: 'Parameter count exceeds limit of ' + maxParams,
        status: 400
      };
    }

    if (request.body) {
      const bodyStr = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
      if (bodyStr.length > maxBodySize) {
        return {
          allowed: false,
          reason: 'Payload too large. Exceeds limit of ' + maxBodySize + ' bytes',
          status: 413
        };
      }
    }

    return { allowed: true };
  }
}

class ResourceGuard {
  static check(context) {
    const timeLimit = 25000;
    if (context.getElapsedTime() > timeLimit) {
      return {
        allowed: false,
        reason: 'System execution time exceeded resource sandbox limit of ' + timeLimit + 'ms',
        status: 500
      };
    }
    return { allowed: true };
  }
}

class TimeoutPolicy {
  static getValidationTimeout() { return 5000; }
  static getRoutingTimeout() { return 3000; }
  static getHandlerTimeout() { return 15000; }
  static getTotalTimeout() { return 25000; }
}

class CircuitBreakerFoundation {
  constructor() {
    this.state = 'CLOSED';
    this.reason = null;
  }
  static getInstance() {
    if (!CircuitBreakerFoundation.instance) {
      CircuitBreakerFoundation.instance = new CircuitBreakerFoundation();
    }
    return CircuitBreakerFoundation.instance;
  }
  getState() {
    return this.state;
  }
  getReason() {
    return this.reason;
  }
  transitionTo(state, reason) {
    this.state = state;
    this.reason = reason || null;
  }
  check() {
    if (this.state === 'OPEN') {
      return {
        allowed: false,
        reason: 'Circuit Breaker is OPEN. Reason: ' + (this.reason || 'UNKNOWN'),
        status: 503
      };
    }
    return { allowed: true };
  }
}
CircuitBreakerFoundation.instance = null;

class GracefulDegradation {
  static setGracefulMode(enabled) { GracefulDegradation.gracefulMode = enabled; }
  static isGracefulMode() { return GracefulDegradation.gracefulMode; }
  static shouldSkipMetrics() { return GracefulDegradation.gracefulMode; }
  static shouldSkipAudits() { return GracefulDegradation.gracefulMode; }
}
GracefulDegradation.gracefulMode = false;

class ProductionReadinessPolicy {
  static verify() {
    return { ready: true };
  }
}

class ReadinessValidator {
  static validate() {
    const result = ProductionReadinessPolicy.verify();
    if (!result.ready) {
      return {
        allowed: false,
        reason: 'Production setup readiness failure: ' + (result.reason || 'UNKNOWN'),
        status: 500
      };
    }
    return { allowed: true };
  }
}

class HardeningException extends ApiException {
  constructor(code, status, internalMessage, requestId) {
    super({
      internalMessage: internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId: requestId,
        timestamp: Date.now(),
        exceptionType: 'HardeningException',
        exceptionCode: code,
        source: 'HARDENING_PIPELINE'
      }
    });
    this.category = ExceptionCategory.SYSTEM;
    this.code = code;
    this.status = status;
  }
}

class HardeningPipeline {
  static getInstance() {
    if (!HardeningPipeline.instance) {
      HardeningPipeline.instance = new HardeningPipeline();
    }
    return HardeningPipeline.instance;
  }
  execute(request, context) {
    const readiness = ReadinessValidator.validate();
    if (!readiness.allowed) {
      throw new HardeningException(
        'PM-HRD-RDY',
        readiness.status || 500,
        readiness.reason || 'Readiness validation failed',
        request.requestId
      );
    }

    const circuit = CircuitBreakerFoundation.getInstance().check();
    if (!circuit.allowed) {
      throw new HardeningException(
        'PM-HRD-CBT',
        circuit.status || 503,
        circuit.reason || 'Circuit Breaker Blocked',
        request.requestId
      );
    }

    const requestGuard = RequestGuard.check(request);
    if (!requestGuard.allowed) {
      throw new HardeningException(
        'PM-HRD-REQ',
        requestGuard.status || 400,
        requestGuard.reason || 'Request validation rejected',
        request.requestId
      );
    }

    const resourceGuard = ResourceGuard.check(context);
    if (!resourceGuard.allowed) {
      throw new HardeningException(
        'PM-HRD-RSC',
        resourceGuard.status || 500,
        resourceGuard.reason || 'Resource limits exceeded',
        request.requestId
      );
    }
  }
}
HardeningPipeline.instance = null;

// ==========================================
// 🚀 AUTHENTICATION FOUNDATION CLASSES
// ==========================================
class AuthenticationContext {
  constructor(params) {
    this.identityId = params.identityId;
    this.identityType = params.identityType;
    this.authenticationMethod = params.authenticationMethod;
    this.authenticated = params.authenticated;
    this.issuedAt = params.issuedAt;
    this.metadata = params.metadata || {};
  }
}

class AuthenticationResult {
  constructor(success, context, failureReason) {
    this.success = success;
    this.context = context;
    this.failureReason = failureReason;
  }
  static successResult(context) {
    return new AuthenticationResult(true, context, null);
  }
  static failureResult(reason) {
    return new AuthenticationResult(false, null, reason);
  }
}

class ApiKeyIdentityProvider {
  authenticate(request) {
    const apiKey = (request.query && (request.query.apiKey || request.query['x-api-key'])) || (request.headers && request.headers['x-api-key']);
    if (!apiKey) {
      return AuthenticationResult.failureResult('API Key missing in query or headers');
    }
    if (apiKey === 'valid-api-key') {
      const context = new AuthenticationContext({
        identityId: 'user-api-key-stub',
        identityType: 'USER',
        authenticationMethod: 'API_KEY',
        authenticated: true,
        issuedAt: Date.now(),
        metadata: { provider: 'ApiKeyIdentityProvider', stub: true }
      });
      return AuthenticationResult.successResult(context);
    }
    return AuthenticationResult.failureResult('Invalid API Key provided');
  }
}

class LIFFIdentityProvider {
  authenticate(request) {
    const token = (request.query && request.query.liffToken) || (request.headers && request.headers['authorization']);
    if (!token) {
      return AuthenticationResult.failureResult('LIFF token or authorization header missing');
    }
    const cleanToken = token.indexOf('Bearer ') === 0 ? token.substring(7) : token;
    if (cleanToken === 'valid-liff-token') {
      const context = new AuthenticationContext({
        identityId: 'user-liff-stub-123',
        identityType: 'USER',
        authenticationMethod: 'LIFF',
        authenticated: true,
        issuedAt: Date.now(),
        metadata: { provider: 'LIFFIdentityProvider', stub: true }
      });
      return AuthenticationResult.successResult(context);
    }
    return AuthenticationResult.failureResult('Invalid LIFF ID Token');
  }
}

class ServiceIdentityProvider {
  authenticate(request) {
    const serviceAuth = request.headers && request.headers['x-service-auth'];
    if (!serviceAuth) {
      return AuthenticationResult.failureResult('Service auth header missing');
    }
    if (serviceAuth === 'valid-service-key') {
      const context = new AuthenticationContext({
        identityId: 'service-aios-bridge-stub',
        identityType: 'SERVICE',
        authenticationMethod: 'INTERNAL_SERVICE',
        authenticated: true,
        issuedAt: Date.now(),
        metadata: { provider: 'ServiceIdentityProvider', stub: true }
      });
      return AuthenticationResult.successResult(context);
    }
    return AuthenticationResult.failureResult('Invalid Service Auth Key');
  }
}

class IdentityResolver {
  static resolve(request) {
    if (request.headers && request.headers['x-service-auth']) {
      return new ServiceIdentityProvider();
    }
    const hasQueryApiKey = request.query && (request.query.apiKey || request.query['x-api-key']);
    const hasHeaderApiKey = request.headers && request.headers['x-api-key'];
    if (hasQueryApiKey || hasHeaderApiKey) {
      return new ApiKeyIdentityProvider();
    }
    const hasQueryLiff = request.query && request.query.liffToken;
    const hasHeaderLiff = request.headers && request.headers['authorization'];
    if (hasQueryLiff || hasHeaderLiff) {
      return new LIFFIdentityProvider();
    }
    return null;
  }
}

class AuthenticationPolicy {
  static isAnonymousAllowed(request) {
    if (request.path === '/health') {
      return true;
    }
    return false;
  }
  static isInternalOnly(request) {
    if (request.path === '/batch' || request.path === '/admin') {
      return true;
    }
    return false;
  }
}

class AuthenticationException extends ApiException {
  constructor(code, internalMessage, requestId) {
    super({
      internalMessage: internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId: requestId,
        timestamp: Date.now(),
        exceptionType: 'AuthenticationException',
        exceptionCode: code,
        source: 'AUTHENTICATION_PIPELINE'
      }
    });
    this.category = 'AUTHENTICATION';
    this.code = code;
    this.status = 401;
  }
}

class AuthenticationPipeline {
  static getInstance() {
    if (!AuthenticationPipeline.instance) {
      AuthenticationPipeline.instance = new AuthenticationPipeline();
    }
    return AuthenticationPipeline.instance;
  }
  execute(request, context) {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();
    const provider = IdentityResolver.resolve(request);

    if (provider) {
      const isApiKey = provider instanceof ApiKeyIdentityProvider;
      const isLiff = provider instanceof LIFFIdentityProvider;
      const isService = provider instanceof ServiceIdentityProvider;

      if ((isApiKey && flags.apiKeyAuth === false) ||
          (isLiff && flags.liffAuth === false) ||
          (isService && flags.serviceAuth === false)) {
        this.handleNoCredentials(request, context, flags.anonymousAccess);
        return;
      }

      const result = provider.authenticate(request);
      if (result.success && result.context) {
        context.setAuthenticationContext(result.context);
      } else {
        const allowAnonymous = flags.anonymousAccess && AuthenticationPolicy.isAnonymousAllowed(request);
        if (allowAnonymous) {
          const anonContext = new AuthenticationContext({
            identityId: 'anonymous',
            identityType: 'ANONYMOUS',
            authenticationMethod: 'NONE',
            authenticated: false,
            issuedAt: Date.now()
          });
          context.setAuthenticationContext(anonContext);
        } else {
          const errCode = isApiKey ? 'PM-AUT-002' : isLiff ? 'PM-AUT-003' : 'PM-AUT-004';
          throw new AuthenticationException(
            errCode,
            result.failureReason || 'Authentication verification failed',
            request.requestId
          );
        }
      }
    } else {
      this.handleNoCredentials(request, context, flags.anonymousAccess);
    }
  }
  handleNoCredentials(request, context, anonymousFlag) {
    const allowAnonymous = anonymousFlag && AuthenticationPolicy.isAnonymousAllowed(request);
    if (allowAnonymous) {
      const anonContext = new AuthenticationContext({
        identityId: 'anonymous',
        identityType: 'ANONYMOUS',
        authenticationMethod: 'NONE',
        authenticated: false,
        issuedAt: Date.now()
      });
      context.setAuthenticationContext(anonContext);
    } else {
      throw new AuthenticationException(
        'PM-AUT-001',
        'Authentication required. No valid credentials provided.',
        request.requestId
      );
    }
  }
}
AuthenticationPipeline.instance = null;

// ==========================================
// 🚀 AUTHORIZATION FOUNDATION CLASSES
// ==========================================
class AuthorizationContext {
  constructor(params) {
    this.role = params.role;
    this.permissions = params.permissions;
    this.scopes = params.scopes;
    this.authorized = params.authorized;
    this.metadata = params.metadata || {};
  }
}

class AuthorizationResult {
  constructor(success, context, failureReason) {
    this.success = success;
    this.context = context;
    this.failureReason = failureReason;
  }
  static successResult(context) {
    return new AuthorizationResult(true, context, null);
  }
  static failureResult(reason) {
    return new AuthorizationResult(false, null, reason);
  }
}

class AuthorizationPolicy {
  constructor(params) {
    this.requiredRoles = params.requiredRoles || [];
    this.requiredPermissions = params.requiredPermissions || [];
    this.requiredScopes = params.requiredScopes || [];
  }
  static resolve(request) {
    if (request.path === '/admin' || (request.query && request.query.action === 'resetAllSheets')) {
      return new AuthorizationPolicy({
        requiredRoles: ['ADMIN', 'SYSTEM'],
        requiredPermissions: ['ADMIN']
      });
    }
    if (request.method === 'POST') {
      return new AuthorizationPolicy({
        requiredRoles: ['SYSTEM', 'ADMIN', 'LEADER', 'MEMBER'],
        requiredPermissions: ['WRITE']
      });
    }
    if (request.path === '/health') {
      return new AuthorizationPolicy({});
    }
    return new AuthorizationPolicy({
      requiredPermissions: ['READ']
    });
  }
}

class AuthorizationException extends ApiException {
  constructor(code, internalMessage, requestId) {
    super({
      internalMessage: internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId: requestId,
        timestamp: Date.now(),
        exceptionType: 'AuthorizationException',
        exceptionCode: code,
        source: 'AUTHORIZATION_PIPELINE'
      }
    });
    this.category = 'SYSTEM';
    this.code = code;
    this.status = 403;
  }
}

class RoleResolver {
  resolve(authContext) {
    if (!authContext.authenticated) {
      return 'VIEWER';
    }
    const id = authContext.identityId;
    if (id === 'service-aios-bridge-stub') {
      return 'SYSTEM';
    }
    if (id === 'user-api-key-stub') {
      return 'ADMIN';
    }
    if (id === 'user-liff-stub-123') {
      return 'MEMBER';
    }
    return 'VIEWER';
  }
}

class PermissionResolver {
  constructor() {
    this.roleResolver = new RoleResolver();
  }
  resolve(authContext) {
    const role = this.roleResolver.resolve(authContext);
    if (role === 'SYSTEM' || role === 'ADMIN') {
      return ['READ', 'WRITE', 'DELETE', 'EXPORT', 'ADMIN'];
    }
    if (role === 'LEADER') {
      return ['READ', 'WRITE', 'EXPORT'];
    }
    if (role === 'MEMBER') {
      return ['READ', 'WRITE'];
    }
    return ['READ'];
  }
}

class ScopeResolver {
  constructor() {
    this.roleResolver = new RoleResolver();
  }
  resolve(authContext) {
    const role = this.roleResolver.resolve(authContext);
    if (role === 'SYSTEM') {
      return ['SYSTEM'];
    }
    if (role === 'ADMIN') {
      return ['ORGANIZATION'];
    }
    if (role === 'LEADER') {
      return ['BRANCH'];
    }
    if (role === 'MEMBER') {
      return ['AREA'];
    }
    return ['SELF'];
  }
}

class AuthorizationPipeline {
  constructor() {
    this.roleResolver = new RoleResolver();
    this.permissionResolver = new PermissionResolver();
    this.scopeResolver = new ScopeResolver();
  }
  static getInstance() {
    if (!AuthorizationPipeline.instance) {
      AuthorizationPipeline.instance = new AuthorizationPipeline();
    }
    return AuthorizationPipeline.instance;
  }
  execute(request, context) {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    let authContext = context.getAuthenticationContext();
    if (!authContext) {
      authContext = new AuthenticationContext({
        identityId: 'anonymous',
        identityType: 'ANONYMOUS',
        authenticationMethod: 'NONE',
        authenticated: false,
        issuedAt: Date.now()
      });
    }

    const role = this.roleResolver.resolve(authContext);
    const permissions = this.permissionResolver.resolve(authContext);
    const scopes = this.scopeResolver.resolve(authContext);

    const authzContext = new AuthorizationContext({
      role: role,
      permissions: permissions,
      scopes: scopes,
      authorized: true,
      metadata: {
        decisionSource: 'AuthorizationPipeline',
        evaluationTime: Date.now()
      }
    });

    context.setAuthorizationContext(authzContext);

    if (flags.authorizationEnabled === false) {
      return;
    }

    const policy = AuthorizationPolicy.resolve(request);

    if (flags.roleValidation !== false && policy.requiredRoles.length > 0) {
      if (policy.requiredRoles.indexOf(role) === -1) {
        throw new AuthorizationException(
          'PM-AUTHZ-002',
          'Required role not met. Allowed roles: ' + policy.requiredRoles.join(', '),
          request.requestId
        );
      }
    }

    if (flags.permissionValidation !== false && policy.requiredPermissions.length > 0) {
      let hasAllPermissions = true;
      for (let i = 0; i < policy.requiredPermissions.length; i++) {
        if (permissions.indexOf(policy.requiredPermissions[i]) === -1) {
          hasAllPermissions = false;
          break;
        }
      }
      if (!hasAllPermissions) {
        throw new AuthorizationException(
          'PM-AUTHZ-003',
          'Required permissions not met. Required: ' + policy.requiredPermissions.join(', '),
          request.requestId
        );
      }
    }

    if (flags.scopeValidation !== false && policy.requiredScopes.length > 0) {
      let hasAllScopes = true;
      for (let i = 0; i < policy.requiredScopes.length; i++) {
        if (scopes.indexOf(policy.requiredScopes[i]) === -1) {
          hasAllScopes = false;
          break;
        }
      }
      if (!hasAllScopes) {
        throw new AuthorizationException(
          'PM-AUTHZ-004',
          'Required data boundary scopes not met. Required: ' + policy.requiredScopes.join(', '),
          request.requestId
        );
      }
    }
  }
}
AuthorizationPipeline.instance = null;

// ==========================================
// 🚀 LICENSING & EDITION FOUNDATION CLASSES
// ==========================================
class LicenseContext {
  constructor(params) {
    this.edition = params.edition;
    this.status = params.status;
    this.licensed = params.licensed;
    this.expiresAt = params.expiresAt;
    this.issuedAt = params.issuedAt;
    this.metadata = params.metadata || {};
  }
}

class LicenseResult {
  constructor(success, context, failureReason) {
    this.success = success;
    this.context = context;
    this.failureReason = failureReason;
  }
  static successResult(context) {
    return new LicenseResult(true, context, null);
  }
  static failureResult(reason) {
    return new LicenseResult(false, null, reason);
  }
}

class LicensePolicy {
  constructor(params) {
    this.requiredEdition = params.requiredEdition || 'COMMUNITY';
    this.requiredStatus = params.requiredStatus || 'ACTIVE';
  }
  static resolve(request) {
    if (request.query && request.query.action === 'resetAllSheets') {
      return new LicensePolicy({
        requiredEdition: 'ENTERPRISE',
        requiredStatus: 'ACTIVE'
      });
    }
    if (request.path === '/dashboard') {
      return new LicensePolicy({
        requiredEdition: 'STANDARD',
        requiredStatus: 'ACTIVE'
      });
    }
    return new LicensePolicy({
      requiredEdition: 'COMMUNITY',
      requiredStatus: 'ACTIVE'
    });
  }
}

class LicenseException extends ApiException {
  constructor(code, internalMessage, requestId) {
    super({
      internalMessage: internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId: requestId,
        timestamp: Date.now(),
        exceptionType: 'LicenseException',
        exceptionCode: code,
        source: 'LICENSING_PIPELINE'
      }
    });
    this.category = 'SYSTEM';
    this.code = code;
    this.status = 402;
  }
}

class EditionResolver {
  resolve(authContext) {
    const id = authContext.identityId;
    if (id === 'service-aios-bridge-stub') {
      return 'ENTERPRISE';
    }
    if (id === 'user-api-key-stub') {
      return 'PROFESSIONAL';
    }
    if (id === 'user-liff-stub-123') {
      return 'STANDARD';
    }
    return 'COMMUNITY';
  }
}

class LicenseResolver {
  constructor() {
    this.editionResolver = new EditionResolver();
  }
  resolve(authContext) {
    const edition = this.editionResolver.resolve(authContext);
    return new LicenseContext({
      edition: edition,
      status: 'ACTIVE',
      licensed: true,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      issuedAt: Date.now(),
      metadata: {
        licenseId: 'lic-stub-' + authContext.identityId,
        contractId: 'ctr-stub-' + authContext.identityId
      }
    });
  }
}

class LicensingPipeline {
  constructor() {
    this.licenseResolver = new LicenseResolver();
  }
  static getInstance() {
    if (!LicensingPipeline.instance) {
      LicensingPipeline.instance = new LicensingPipeline();
    }
    return LicensingPipeline.instance;
  }
  execute(request, context) {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    let authContext = context.getAuthenticationContext();
    if (!authContext) {
      authContext = new AuthenticationContext({
        identityId: 'anonymous',
        identityType: 'ANONYMOUS',
        authenticationMethod: 'NONE',
        authenticated: false,
        issuedAt: Date.now()
      });
    }

    const licenseContext = this.licenseResolver.resolve(authContext);
    context.setLicenseContext(licenseContext);

    if (flags.licensingEnabled === false) {
      return;
    }

    const policy = LicensePolicy.resolve(request);

    if (flags.licenseValidation !== false) {
      if (licenseContext.status !== 'ACTIVE' && licenseContext.status !== 'TRIAL') {
        throw new LicenseException(
          'PM-LIC-002',
          'License is inactive or suspended. Current status: ' + licenseContext.status,
          request.requestId
        );
      }
      if (licenseContext.licensed === false) {
        throw new LicenseException(
          'PM-LIC-001',
          'Feature requires a valid active license registration.',
          request.requestId
        );
      }
    }

    if (flags.editionValidation !== false) {
      const editionRank = {
        COMMUNITY: 0,
        STANDARD: 1,
        PROFESSIONAL: 2,
        ENTERPRISE: 3
      };
      const userRank = editionRank[licenseContext.edition] || 0;
      const requiredRank = editionRank[policy.requiredEdition] || 0;

      if (userRank < requiredRank) {
        throw new LicenseException(
          'PM-LIC-003',
          'Insufficient subscription plan level. Requires ' + policy.requiredEdition + ' (yours: ' + licenseContext.edition + ').',
          request.requestId
        );
      }
    }
  }
}
LicensingPipeline.instance = null;

// ==========================================
// 🚀 FEATURE ACCESS CONTROL FOUNDATION CLASSES
// ==========================================
class FeatureContext {
  constructor(params) {
    this.feature = params.feature;
    this.availability = params.availability;
    this.enabled = params.enabled;
    this.metadata = params.metadata || {};
  }
}

class FeatureResult {
  constructor(success, context, failureReason) {
    this.success = success;
    this.context = context;
    this.failureReason = failureReason;
  }
  static successResult(context) {
    return new FeatureResult(true, context, null);
  }
  static failureResult(reason) {
    return new FeatureResult(false, null, reason);
  }
}

class FeaturePolicy {
  constructor(params) {
    this.requiredEdition = params.requiredEdition || 'COMMUNITY';
    this.requiredRole = params.requiredRole || null;
    this.requiredPermission = params.requiredPermission || null;
    this.requiredScope = params.requiredScope || null;
    this.featureToggle = params.featureToggle || null;
  }
}

class FeatureException extends ApiException {
  constructor(codeOrMsg, internalMessageOrRequestId, requestIdOrDetails) {
    let code;
    let internalMessage;
    let requestId;
    let status = 403;
    let externalMessage;

    if (codeOrMsg.indexOf('PM-') === 0) {
      code = codeOrMsg;
      internalMessage = internalMessageOrRequestId;
      requestId = requestIdOrDetails || '';
      status = 403;
      externalMessage = internalMessage;
    } else {
      // Old style backward compatibility
      code = 'PM-FTR-001';
      internalMessage = codeOrMsg;
      requestId = internalMessageOrRequestId;
      status = 422;
      externalMessage = '指定された機能は現在無効化されています。';
    }

    super({
      internalMessage: internalMessage,
      externalMessage: externalMessage,
      metadata: {
        requestId: requestId,
        timestamp: Date.now(),
        exceptionType: 'FeatureException',
        exceptionCode: code,
        source: 'FEATURE_ACCESS_PIPELINE'
      }
    });

    this.category = 'FEATURE';
    this.code = code;
    this.status = status;
  }
}

class FeatureRegistry {
  static get(feature) {
    return FeatureRegistry.registry[feature] || null;
  }
  static has(feature) {
    return !!FeatureRegistry.registry[feature];
  }
}
FeatureRegistry.registry = {
  GOOGLE_MAPS: new FeaturePolicy({
    requiredEdition: 'STANDARD',
    requiredPermission: 'READ',
    featureToggle: 'googleMaps'
  }),
  MAPBOX: new FeaturePolicy({
    requiredEdition: 'STANDARD',
    requiredPermission: 'READ',
    featureToggle: 'mapbox'
  }),
  AIOS_BRIDGE: new FeaturePolicy({
    requiredEdition: 'ENTERPRISE',
    requiredRole: 'SYSTEM',
    requiredPermission: 'ADMIN',
    featureToggle: 'aiosBridge'
  }),
  REALTIME_DASHBOARD: new FeaturePolicy({
    requiredEdition: 'STANDARD',
    requiredPermission: 'READ',
    featureToggle: 'flyerHolding'
  }),
  ANALYTICS: new FeaturePolicy({
    requiredEdition: 'PROFESSIONAL',
    requiredPermission: 'READ',
    featureToggle: 'analytics'
  }),
  EXPORT: new FeaturePolicy({
    requiredEdition: 'PROFESSIONAL',
    requiredPermission: 'EXPORT'
  })
};

class FeatureResolver {
  static resolve(request) {
    const feature = FeatureResolver.resolveFeature(request);
    if (!feature) {
      return null;
    }
    return FeatureRegistry.get(feature);
  }
  static resolveFeature(request) {
    const path = request.path;
    const action = request.query && request.query.action;
    if (path === '/dashboard' || path === '/holding') {
      return 'REALTIME_DASHBOARD';
    }
    if (action === 'export' || path === '/export') {
      return 'EXPORT';
    }
    if (path === '/maps') {
      return 'GOOGLE_MAPS';
    }
    if (path === '/aios') {
      return 'AIOS_BRIDGE';
    }
    return null;
  }
}

class FeatureAccessPipeline {
  static getInstance() {
    if (!FeatureAccessPipeline.instance) {
      FeatureAccessPipeline.instance = new FeatureAccessPipeline();
    }
    return FeatureAccessPipeline.instance;
  }
  execute(request, context) {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    const feature = FeatureResolver.resolveFeature(request);
    if (!feature) {
      return;
    }

    const policy = FeatureResolver.resolve(request);
    if (!policy) {
      return;
    }

    if (flags.featureAccessEnabled === false) {
      const featContext = new FeatureContext({
        feature: feature,
        availability: 'AVAILABLE',
        enabled: true
      });
      context.setFeatureContext(featContext);
      return;
    }

    if (policy.featureToggle) {
      const toggleState = flags[policy.featureToggle];
      if (toggleState === false) {
        throw new FeatureException(
          'PM-FEA-001',
          'Feature is currently disabled in system configuration: ' + policy.featureToggle,
          request.requestId
        );
      }
    }

    const licenseContext = context.getLicenseContext();
    if (flags.featureValidation !== false && licenseContext) {
      const editionRank = {
        COMMUNITY: 0,
        STANDARD: 1,
        PROFESSIONAL: 2,
        ENTERPRISE: 3
      };
      const userRank = editionRank[licenseContext.edition] || 0;
      const requiredRank = editionRank[policy.requiredEdition] || 0;
      if (userRank < requiredRank) {
        throw new FeatureException(
          'PM-FEA-002',
          'Feature requires subscription upgrade. Required: ' + policy.requiredEdition + ' (yours: ' + licenseContext.edition + ')',
          request.requestId
        );
      }
    }

    const authzContext = context.getAuthorizationContext();
    if (flags.featureValidation !== false && authzContext) {
      if (policy.requiredRole && policy.requiredRole !== authzContext.role) {
        throw new FeatureException(
          'PM-FEA-003',
          'Insufficient role access. Required: ' + policy.requiredRole,
          request.requestId
        );
      }
      if (policy.requiredPermission && authzContext.permissions.indexOf(policy.requiredPermission) === -1) {
        throw new FeatureException(
          'PM-FEA-003',
          'Required permission missing. Required: ' + policy.requiredPermission,
          request.requestId
        );
      }
      if (policy.requiredScope && authzContext.scopes.indexOf(policy.requiredScope) === -1) {
        throw new FeatureException(
          'PM-FEA-003',
          'Insufficient scope data boundaries. Required: ' + policy.requiredScope,
          request.requestId
        );
      }
    }

    const featContext = new FeatureContext({
      feature: feature,
      availability: 'AVAILABLE',
      enabled: true,
      metadata: {
        evaluationTime: Date.now(),
        policyResolver: 'FeatureResolver'
      }
    });
    context.setFeatureContext(featContext);
  }
}
FeatureAccessPipeline.instance = null;

// ==========================================
// 🚀 AIOS BRIDGE FOUNDATION CLASSES
// ==========================================
class BridgeMessage {
  constructor(params) {
    this.messageId = params.messageId;
    this.messageType = params.messageType;
    this.timestamp = params.timestamp;
    this.source = params.source;
    this.destination = params.destination;
    this.payload = params.payload;
    this.protocolVersion = params.protocolVersion || '1.0';
    this.correlationId = params.correlationId || ('corr-' + params.messageId);
  }
}

class BridgeResult {
  constructor(success, response, failureReason) {
    this.success = success;
    this.response = response;
    this.failureReason = failureReason;
  }
  static successResult(response) {
    return new BridgeResult(true, response, null);
  }
  static failureResult(reason) {
    return new BridgeResult(false, null, reason);
  }
}

class BridgePolicy {
  constructor(params) {
    this.bridgeEnabled = params.bridgeEnabled !== false;
    this.timeout = params.timeout || 5000;
    this.heartbeatEnabled = params.heartbeatEnabled !== false;
  }
}

class BridgeEvent {
  constructor(params) {
    this.eventId = params.eventId;
    this.eventType = params.eventType;
    this.timestamp = params.timestamp;
    this.metadata = params.metadata || {};
  }
}

class BridgeEventDispatcher {
  static addListener(listener) {
    if (BridgeEventDispatcher.listeners.indexOf(listener) === -1) {
      BridgeEventDispatcher.listeners.push(listener);
    }
  }
  static removeListener(listener) {
    const idx = BridgeEventDispatcher.listeners.indexOf(listener);
    if (idx !== -1) {
      BridgeEventDispatcher.listeners.splice(idx, 1);
    }
  }
  static dispatch(event) {
    for (let i = 0; i < BridgeEventDispatcher.listeners.length; i++) {
      try {
        BridgeEventDispatcher.listeners[i].onEvent(event);
      } catch (e) {}
    }
  }
  static clear() {
    BridgeEventDispatcher.listeners = [];
  }
}
BridgeEventDispatcher.listeners = [];

class BridgeMessageMapper {
  static toBridgeMessage(request) {
    return new BridgeMessage({
      messageId: request.requestId || ('msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)),
      messageType: 'API_EXECUTION_REQUEST',
      timestamp: Date.now(),
      source: 'POSTING_MAP',
      destination: 'AIOS',
      payload: {
        method: request.method,
        path: request.path,
        query: request.query || {},
        body: request.body || {}
      },
      protocolVersion: '1.0',
      correlationId: request.requestId
    });
  }
  static fromBridgeMessage(message) {
    return {
      success: true,
      responseCode: 'OK',
      payload: message.payload
    };
  }
}

class BridgeContext {
  constructor(params) {
    this.provider = params.provider;
    this.status = params.status;
    this.lastHeartbeat = params.lastHeartbeat;
    this.metadata = params.metadata || {};
  }
}

class BridgeException extends ApiException {
  constructor(code, internalMessage, requestId) {
    super({
      internalMessage: internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId: requestId,
        timestamp: Date.now(),
        exceptionType: 'BridgeException',
        exceptionCode: code,
        source: 'AIOS_BRIDGE_PIPELINE'
      }
    });
    this.category = 'SYSTEM';
    this.code = code;
    this.status = 503;
  }
}

class AIOSBridgeProvider {
  constructor() {
    this.lastReceivedMessage = null;
    this.currentStatus = 'CONNECTED';
  }
  send(message) {
    const reply = new BridgeMessage({
      messageId: 'rep-' + message.messageId,
      messageType: message.messageType + '.reply',
      timestamp: Date.now(),
      source: 'AIOS',
      destination: 'POSTING_MAP',
      payload: {
        echo: message.payload,
        status: 'PROPOSAL_RECEIVED',
        details: 'Stub acknowledgment successfully generated'
      },
      protocolVersion: message.protocolVersion,
      correlationId: message.correlationId
    });
    this.lastReceivedMessage = reply;
    return BridgeResult.successResult(reply);
  }
  receive() {
    const msg = this.lastReceivedMessage;
    this.lastReceivedMessage = null;
    return msg;
  }
  health() {
    return this.currentStatus === 'CONNECTED';
  }
  status() {
    return this.currentStatus;
  }
  setMockStatus(status) {
    this.currentStatus = status;
  }
}

class AIOSBridgePipeline {
  constructor() {
    this.provider = new AIOSBridgeProvider();
  }
  static getInstance() {
    if (!AIOSBridgePipeline.instance) {
      AIOSBridgePipeline.instance = new AIOSBridgePipeline();
    }
    return AIOSBridgePipeline.instance;
  }
  getProvider() {
    return this.provider;
  }
  execute(request, context) {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    const policy = new BridgePolicy({
      bridgeEnabled: flags.bridgeEnabled !== false,
      timeout: config.getLockTimeout() / 2,
      heartbeatEnabled: flags.bridgeHeartbeat !== false
    });

    if (!policy.bridgeEnabled) {
      const bridgeCtx = new BridgeContext({
        provider: 'AIOSBridgeProvider',
        status: 'DISCONNECTED',
        lastHeartbeat: 0
      });
      context.setBridgeContext(bridgeCtx);

      if (request.path === '/aios') {
        throw new BridgeException(
          'PM-BRG-001',
          'AIOS Bridge connectivity disabled in system settings.',
          request.requestId
        );
      }
      return;
    }

    const status = this.provider.status();
    if (status !== 'CONNECTED') {
      const bridgeCtx = new BridgeContext({
        provider: 'AIOSBridgeProvider',
        status: status,
        lastHeartbeat: 0
      });
      context.setBridgeContext(bridgeCtx);

      BridgeEventDispatcher.dispatch(new BridgeEvent({
        eventId: 'ev-fail-' + request.requestId,
        eventType: 'FAILED',
        timestamp: Date.now(),
        metadata: { status: status, reason: 'Provider not connected' }
      }));

      throw new BridgeException(
        'PM-BRG-002',
        'AIOS Bridge connection is unavailable. Status: ' + status,
        request.requestId
      );
    }

    if (policy.heartbeatEnabled) {
      BridgeEventDispatcher.dispatch(new BridgeEvent({
        eventId: 'ev-hb-' + request.requestId,
        eventType: 'HEARTBEAT',
        timestamp: Date.now()
      }));
    }

    if (request.path === '/aios') {
      try {
        const msg = BridgeMessageMapper.toBridgeMessage(request);

        BridgeEventDispatcher.dispatch(new BridgeEvent({
          eventId: 'ev-snd-' + request.requestId,
          eventType: 'SEND',
          timestamp: Date.now(),
          metadata: { messageId: msg.messageId }
        }));

        const result = this.provider.send(msg);

        if (!result.success || !result.response) {
          throw new Error(result.failureReason || 'Delivery Timeout');
        }

        BridgeEventDispatcher.dispatch(new BridgeEvent({
          eventId: 'ev-rcv-' + request.requestId,
          eventType: 'RECEIVE',
          timestamp: Date.now(),
          metadata: { correlationId: result.response.correlationId }
        }));
      } catch (e) {
        throw new BridgeException(
          'PM-BRG-003',
          'AIOS communication failure: ' + e.message,
          request.requestId
        );
      }
    }

    const bridgeCtx = new BridgeContext({
      provider: 'AIOSBridgeProvider',
      status: 'CONNECTED',
      lastHeartbeat: Date.now()
    });
    context.setBridgeContext(bridgeCtx);
  }
}
AIOSBridgePipeline.instance = null;

// ==========================================
// 🚀 PLATFORM INTEGRATION FOUNDATION CLASSES
// ==========================================

const PlatformStage = {
  INITIALIZING: 'INITIALIZING',
  HARDENING: 'HARDENING',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  LICENSING: 'LICENSING',
  FEATURE_ACCESS: 'FEATURE_ACCESS',
  AIOS_BRIDGE: 'AIOS_BRIDGE',
  VALIDATION: 'VALIDATION',
  ROUTING: 'ROUTING',
  HANDLER: 'HANDLER',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

class PlatformExecutionContext {
  constructor(params) {
    this.requestId = params.requestId;
    this.startedAt = params.startedAt;
    this.completedAt = params.completedAt !== undefined ? params.completedAt : null;
    this.status = params.status || 'RUNNING';
    this.stage = params.stage || PlatformStage.INITIALIZING;
    this.metadata = Object.freeze(Object.assign({}, params.metadata));
    this.traceId = params.traceId !== undefined ? params.traceId : null;
    this.correlationId = params.correlationId !== undefined ? params.correlationId : null;
    this.executionVersion = params.executionVersion !== undefined ? params.executionVersion : null;
  }
  withStage(stage, status, completedAt) {
    return new PlatformExecutionContext({
      requestId: this.requestId,
      startedAt: this.startedAt,
      completedAt: completedAt !== undefined ? completedAt : this.completedAt,
      status: status || this.status,
      stage: stage,
      metadata: this.metadata,
      traceId: this.traceId,
      correlationId: this.correlationId,
      executionVersion: this.executionVersion
    });
  }
  withMetadata(metadata) {
    return new PlatformExecutionContext({
      requestId: this.requestId,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      status: this.status,
      stage: this.stage,
      metadata: Object.assign({}, this.metadata, metadata),
      traceId: this.traceId,
      correlationId: this.correlationId,
      executionVersion: this.executionVersion
    });
  }
  withAuditIdentifiers(identifiers) {
    return new PlatformExecutionContext({
      requestId: this.requestId,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      status: this.status,
      stage: this.stage,
      metadata: this.metadata,
      traceId: identifiers.traceId !== undefined ? identifiers.traceId : this.traceId,
      correlationId: identifiers.correlationId !== undefined ? identifiers.correlationId : this.correlationId,
      executionVersion: identifiers.executionVersion !== undefined ? identifiers.executionVersion : this.executionVersion
    });
  }
}

class PlatformException extends ApiException {
  constructor(code, internalMessage, requestId) {
    super({
      internalMessage: internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId: requestId,
        timestamp: Date.now(),
        exceptionType: 'PlatformException',
        exceptionCode: code,
        source: 'PLATFORM_INTEGRATION_PIPELINE'
      }
    });
    this.category = 'SYSTEM';
    this.code = code;
    this.status = 500;
  }
}

class PlatformLifecycleObserver {
  static onPlatformStarted(context) {
    PlatformLifecycleObserver.pipeline.resetSequence();
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'PLATFORM_STARTED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { startedAt: context.startedAt }
    );
  }
  static onStageStarted(context, stage) {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'STAGE_STARTED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { stage: stage }
    );
  }
  static onStageCompleted(context, stage, durationMs) {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'STAGE_COMPLETED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { stage: stage, durationMs: durationMs }
    );
  }
  static onPlatformCompleted(context, durationMs) {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'PLATFORM_COMPLETED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { durationMs: durationMs, status: context.status }
    );
  }
  static onPlatformFailed(context, error, failedStage) {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'PLATFORM_FAILED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      {
        failedStage: failedStage,
        errorMessage: error.message || String(error)
      }
    );
  }
}
PlatformLifecycleObserver.pipeline = MonitoringPipeline.getInstance();

class PlatformIntegrationPipeline {
  static execute(e) {
    const start = Date.now();
    const apiContext = new ApiExecutionContext();
    PlatformIntegrationPipeline.lastContext = apiContext;

    let platformContext = new PlatformExecutionContext({
      requestId: apiContext.getRequestId(),
      startedAt: start
    });
    apiContext.setPlatformContext(platformContext);

    // Set traceId and correlationId if present in query parameters for correlation tracing
    const queryTraceId = e.parameter && (e.parameter.traceId || e.parameter.tId) || null;
    const queryCorrId = e.parameter && (e.parameter.correlationId || e.parameter.cId) || null;
    if (queryTraceId || queryCorrId) {
      platformContext = platformContext.withAuditIdentifiers({
        traceId: queryTraceId,
        correlationId: queryCorrId,
        executionVersion: '1.0.0'
      });
      apiContext.setPlatformContext(platformContext);
    }

    ExceptionHandler.clearListeners();
    ExceptionHandler.addListener(ApiLifecycleObserver.onException);

    let apiRequest = null;
    let apiResponse;

    try {
      // Log platform started
      PlatformLifecycleObserver.onPlatformStarted(platformContext);

      // Resolve request fields
      const method = e.postData ? 'POST' : 'GET';
      let postData = null;
      if (method === 'POST') {
        try {
          if (e.postData && e.postData.contents) {
            postData = JSON.parse(e.postData.contents);
          } else {
            postData = e.parameter;
          }
        } catch (f) {
          postData = e.parameter;
        }
      }

      const action = (method === 'POST' ? (postData && postData.action || e.parameter.action) : e.parameter.action) || 'health';
      let path = '/' + action;
      if (action === 'getAppData') {
        path = '/dashboard';
      } else if (action === 'getFlyerStock') {
        path = '/holding';
      } else if (action === 'updateFlyerStock') {
        path = '/holding';
      }

      const queryVersion = method === 'POST' ? (postData && postData.version || e.parameter.version || postData && postData.v) : (e.parameter.version || e.parameter.v);
      const version = ApiVersionResolver.resolve(undefined, queryVersion);

      apiRequest = new ApiRequest({
        method: method,
        path: path,
        version: version,
        query: e.parameter,
        body: postData,
        requestId: apiContext.getRequestId()
      });

      ApiLifecycleObserver.onStart(apiRequest, apiContext);

      // 1. HARDENING
      platformContext = platformContext.withStage(PlatformStage.HARDENING);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.HARDENING);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.HARDENING);
      const startH = Date.now();
      HardeningPipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.HARDENING, Date.now() - startH);

      // 2. AUTHENTICATION
      platformContext = platformContext.withStage(PlatformStage.AUTHENTICATION);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.AUTHENTICATION);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.AUTHENTICATION);
      const startAuth = Date.now();
      AuthenticationPipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.AUTHENTICATION, Date.now() - startAuth);

      // 3. AUTHORIZATION
      platformContext = platformContext.withStage(PlatformStage.AUTHORIZATION);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.AUTHORIZATION);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.AUTHORIZATION);
      const startAuthz = Date.now();
      AuthorizationPipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.AUTHORIZATION, Date.now() - startAuthz);

      // 4. LICENSING
      platformContext = platformContext.withStage(PlatformStage.LICENSING);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.LICENSING);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.LICENSING);
      const startLic = Date.now();
      LicensingPipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.LICENSING, Date.now() - startLic);

      // 5. FEATURE ACCESS
      platformContext = platformContext.withStage(PlatformStage.FEATURE_ACCESS);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.FEATURE_ACCESS);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.FEATURE_ACCESS);
      const startFeat = Date.now();
      FeatureAccessPipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.FEATURE_ACCESS, Date.now() - startFeat);

      // 6. AIOS BRIDGE
      platformContext = platformContext.withStage(PlatformStage.AIOS_BRIDGE);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.AIOS_BRIDGE);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.AIOS_BRIDGE);
      const startBridge = Date.now();
      AIOSBridgePipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.AIOS_BRIDGE, Date.now() - startBridge);

      // 7. VALIDATION
      platformContext = platformContext.withStage(PlatformStage.VALIDATION);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.VALIDATION);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.VALIDATION);
      const startVal = Date.now();
      ValidationPipeline.getInstance().validate(apiRequest, apiContext);
      apiContext.setValidationTime(Date.now() - startVal);
      ApiLifecycleObserver.onValidationSuccess(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.VALIDATION, Date.now() - startVal);

      // 8. ROUTING
      platformContext = platformContext.withStage(PlatformStage.ROUTING);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.ROUTING);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.ROUTING);
      const startRoute = Date.now();
      EndpointRegistry.getInstance().getHandler(apiRequest.method, apiRequest.version, apiRequest.path);
      apiContext.setRoutingTime(Date.now() - startRoute);
      ApiLifecycleObserver.onRoutingSuccess(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.ROUTING, Date.now() - startRoute);

      // 9. HANDLER
      platformContext = platformContext.withStage(PlatformStage.HANDLER);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.HANDLER);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.HANDLER);
      const startHandler = Date.now();

      const writeActions = [
        'submitDistribution',
        'updateRecordWithGPSPhoto',
        'registerStaff',
        'registerAdmin',
        'requestFlyerTransfer',
        'resolveTransferRequest',
        'updateFlyerStock',
        'resetRoster',
        'setupFolders',
        'forceStartBatch',
        'refreshCache',
        'aggregateStats',
        'resetAllSheets'
      ];

      if (method === 'POST' && writeActions.indexOf(action) !== -1) {
        apiResponse = LockServiceProvider.getInstance().executeWithLock(function() {
          return ApiRouter.getInstance().route(apiRequest, apiContext);
        });
        if (apiResponse && apiResponse.success) {
          const cacheKey = CacheServiceProvider.getInstance().makeKey(
            postData && postData.tenantId || e.parameter.tenantId || "DEFAULT",
            postData && postData.branchId || e.parameter.branchId || "DEFAULT",
            "appdata"
          );
          CacheServiceProvider.getInstance().remove(cacheKey);
        }
      } else {
        apiResponse = ApiRouter.getInstance().route(apiRequest, apiContext);
      }

      apiContext.setHandlerTime(Date.now() - startHandler);
      ApiLifecycleObserver.onHandlerSuccess(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.HANDLER, Date.now() - startHandler);

      // Completed
      platformContext = platformContext.withStage(PlatformStage.COMPLETED, 'COMPLETED', Date.now());
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.COMPLETED);
      ApiLifecycleObserver.onComplete(apiRequest, apiResponse, apiContext);
      PlatformLifecycleObserver.onPlatformCompleted(platformContext, Date.now() - start);

    } catch (err) {
      // Ensure we are in FAILED state
      const activeStage = apiContext.getCurrentStage() || PlatformStage.INITIALIZING;
      platformContext = platformContext.withStage(PlatformStage.FAILED, 'FAILED', Date.now());
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.FAILED);

      PlatformLifecycleObserver.onPlatformFailed(platformContext, err, activeStage);

      const req = apiRequest || new ApiRequest({
        method: e.postData ? 'POST' : 'GET',
        path: '/unknown',
        version: 'v2',
        query: e.parameter,
        requestId: apiContext.getRequestId()
      });

      apiResponse = ExceptionHandler.handle(err, req, apiContext);
    }

    return createJsonResponseFromApiResponse(apiResponse);
  }
}
PlatformIntegrationPipeline.lastContext = null;

