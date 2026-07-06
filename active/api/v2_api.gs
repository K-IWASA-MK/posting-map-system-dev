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


/**
 * GETリクエスト：JSONデータの取得
 */
function doGet(e) {
  const action = e.parameter.action;
  let response;

  try {
    switch (action) {
      case 'getAppData':
        response = getAppData();
        break;
      case 'getRanking':
        response = { success: true, ranking: getRankingData() };
        break;
      case 'getRoster':
        response = { success: true, roster: getRoster() };
        break;
      case 'getAreaDetails':
        response = getAreaDetails(e.parameter.name);
        break;
      case 'getCityAreaDetails':
        response = getCityAreaDetails(e.parameter.cityName);
        break;
      case 'submitDistribution':
        // ⚠️ 書き込み操作はGET禁止。フロントエンドはPOSTで呼び出すこと。
        response = { success: false, message: 'Write operations require POST. Please update the client.' };
        break;
      case 'registerStaff':
        response = registerStaff(e.parameter.lastName, e.parameter.firstName);
        break;
      case 'testDriveAccess':
        // Driveフォルダアクセステスト（診断用）
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
        // Driveファイル書き込みテスト（診断用）
        try {
          const wFolder = DriveApp.getFolderById(getStorageFolderId());
          const testBlob = Utilities.newBlob("POSTING_MAP_TEST_" + Date.now(), "text/plain", "test_write.txt");
          const file = wFolder.createFile(testBlob);
          response = { success: true, message: 'Write OK', fileId: file.getId(), fileName: file.getName() };
          // テストファイルはすぐ削除
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
        response = { success: true, config: getConfig(e.parameter.tenantId || "DEFAULT") };
        break;
      case 'getAuditLogs':
        response = getAuditLogs();
        break;
      case 'refreshCache':
        response = { success: true, data: refreshAreaSummaryCache() };
        break;
      case 'getStrategy':
        response = { success: true, data: generateStrategy(e.parameter.branchId, e.parameter.tenantId || "DEFAULT") };
        break;
      case 'getHeatmap':
        response = { success: true, data: generateHeatmap(e.parameter.branchId, e.parameter.tenantId || "DEFAULT") };
        break;
      case 'getPrediction':
        response = { success: true, data: predictOutcome(e.parameter.branchId, e.parameter.tenantId || "DEFAULT") };
        break;
      default:
        response = { success: true, message: 'POSTING MAP API is online.' };
    }
  } catch (err) {
    response = { success: false, message: err.toString() };
  }

  return createJsonResponse(response);
}

/**
 * POSTリクエスト：データの登録・更新
 */
function doPost(e) {
  let postData;
  try {
    // Content-Typeに依存せずbodyのJSONパースを試みる
    // (フロントエンドはCORSプリフライト回避のためContent-Type未指定で送信)
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      postData = e.parameter;
    }
  } catch (f) {
    postData = e.parameter;
  }

  const action = postData.action || e.parameter.action;
  let response;

  try {
    switch (action) {
      case 'getAppData':
        response = getAppData();
        break;
      case 'getConfig':
        response = { success: true, config: getConfig(postData.tenantId || e.parameter.tenantId || "DEFAULT") };
        break;
      case 'getStrategy':
        response = { success: true, data: generateStrategy(postData.branchId || e.parameter.branchId, postData.tenantId || e.parameter.tenantId || "DEFAULT") };
        break;
      case 'getHeatmap':
        response = { success: true, data: generateHeatmap(postData.branchId || e.parameter.branchId, postData.tenantId || e.parameter.tenantId || "DEFAULT") };
        break;
      case 'getPrediction':
        response = { success: true, data: predictOutcome(postData.branchId || e.parameter.branchId, postData.tenantId || e.parameter.tenantId || "DEFAULT") };
        break;
      case 'getRanking':
        response = { success: true, ranking: getRankingData() };
        break;
      case 'getRoster':
        response = { success: true, roster: getRoster() };
        break;
      case 'getAreaDetails':
        response = getAreaDetails(postData.name || e.parameter.name);
        break;
      case 'getCityAreaDetails':
        response = getCityAreaDetails(postData.cityName || e.parameter.cityName);
        break;
      case 'submitDistribution':
        response = submitDistribution(postData);
        break;
      case 'updateRecordWithGPSPhoto':
        response = updateRecordWithGPSPhoto(postData);
        break;
      case 'registerStaff':
        response = registerStaff(postData.lastName, postData.firstName, postData.lineUserId);
        break;
      case 'registerAdmin':
        response = registerAdmin(postData.displayName, postData.lineUserId);
        break;
      case 'requestFlyerTransfer':
        response = handleRequestFlyerTransfer(postData);
        break;
      case 'resolveTransferRequest':
        response = resolveTransferRequest(postData);
        break;
      case 'resetRoster':
        const rosterMsg = setupRosterSheet();
        response = { success: true, message: rosterMsg };
        break;
      case 'setupFolders':
        const setupMsg = setupGoogleDriveFolders();
        response = { success: true, message: setupMsg };
        break;
      case 'forceStartBatch':
        forceStartBatch();
        response = { success: true, message: 'Batch run initiated successfully' };
        break;
      case 'refreshCache':
        createSystemCacheSheet(); // スキーマ変更に対応するためキャッシュシートを再作成
        const cacheResult = refreshAreaSummaryCache();
        response = { success: true, message: 'Cache sync completed successfully', data: cacheResult };
        break;
      case 'aggregateStats':
        aggregateTotalVolumes();
        response = { success: true, message: 'Aggregation completed successfully' };
        break;
      case 'resetAllSheets':
        deleteAllAreaSheets();
        response = { success: true, message: 'All area sheets reset successfully' };
        break;
      case 'updateFlyerStock':
        response = updateFlyerStock(
          postData.location,
          parseInt(postData.count, 10) || 0,
          postData.staffName,
          postData.staffId
        );
        break;
      default:
        response = { success: false, message: 'Invalid POST action' };
    }
  } catch (err) {
    response = { success: false, message: err.toString() };
  }

  return createJsonResponse(response);
}

// 共通：JSONレスポンス作成
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
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
