/**
 * GAS v2 - 純粋 JSON API エンジン
 * UI(HTML)は一切返却せず、ContentService を通じて JSON のみを応答する。
 */

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

// =============================
// Drive 認証テスト用（認証後は削除可）
// =============================
function authorizeAndTestDriveWrite() {
  try {
    const folderId = CONFIG.STORAGE_PARENT_ID;
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
          const testFolderId = CONFIG.STORAGE_PARENT_ID;
          const testFolder = DriveApp.getFolderById(testFolderId);
          response = {
            success: true,
            message: 'Drive access OK',
            folderId: testFolderId,
            folderName: testFolder.getName(),
            folderUrl: testFolder.getUrl()
          };
        } catch (driveErr) {
          response = { success: false, message: 'Drive access FAILED: ' + driveErr.toString(), folderId: CONFIG.STORAGE_PARENT_ID };
        }
        break;
      case 'testDriveWrite':
        // Driveファイル書き込みテスト（診断用）
        try {
          const wFolder = DriveApp.getFolderById(CONFIG.STORAGE_PARENT_ID);
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
      case 'getRanking':
        response = { success: true, ranking: getRankingData() };
        break;
      case 'getRoster':
        response = { success: true, roster: getRoster() };
        break;
      case 'getAreaDetails':
        response = getAreaDetails(postData.name || e.parameter.name);
        break;
      case 'submitDistribution':
        response = submitDistribution(
          postData.areaName,
          parseInt(postData.rowId, 10),
          postData.staffName,
          parseFloat(postData.count) || 0,
          postData.isDone === 'true' || postData.isDone === true,
          postData.staffId
        );
        break;
      case 'updateRecordWithGPSPhoto':
        response = updateRecordWithGPSPhoto(
          postData.areaName,
          parseInt(postData.rowId, 10),
          postData.isDone === 'true' || postData.isDone === true,
          parseFloat(postData.count) || 0,
          postData.latitude,
          postData.longitude,
          postData.photoData,
          postData.staffName,
          postData.staffId
        );
        break;
      case 'registerStaff':
        response = registerStaff(postData.lastName, postData.firstName);
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
  let dashboardData;
  try {
    dashboardData = getDashboardData();
  } catch (e) {
    dashboardData = { summary: [], stats: { done: 0, total: 0 } };
  }

  // キャッシュデータをそのままマップして返却（シートへのアクセスを完全にゼロにする）
  const areas = (dashboardData && dashboardData.summary) ? dashboardData.summary.map(item => ({
    name: item.name,
    progress: item.total > 0 ? Math.round((item.done / item.total) * 100) : 0,
    done: item.done || 0,
    total: item.total || 0,
    repAddress: item.repAddress || ""
  })) : [];

  const stats = (dashboardData && dashboardData.stats) ? dashboardData.stats : { done: 0, total: 0 };


  // ranking は getRanking アクションで遅延取得（初期ロード軽量化）
  return {
    success: true,
    branchName: getSS().getName().split(/[ \u3000]/)[0] || "支部",
    areas: areas,
    stats: stats
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
    isDone: r[3] === true || r[3] === "TRUE",
    completedAt: r[4] ? String(r[4]).trim() : "",
    count: parseFloat(r[5]) || 0,
    staffName: r[6],
    staffId: r[7] ? String(r[7]).trim() : "",
    gps: r[8] ? String(r[8]).trim() : "",
    photoUrl: r[9] ? String(r[9]).trim() : ""
  }));

  return { success: true, points: points };
}

function getRoster() {
  const s = getSS().getSheetByName(CONFIG.SHEET_ROSTER);
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

function submitDistribution(areaName, rowId, staffName, count, isDone, staffId) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000); // 5秒（setValuesのみの軽量操作なので十分）
  } catch (e) {
    throw new Error("サーバーが混雑しています。時間をおいて再度お試しください。");
  }

  try {
    const ss = getSS();
    const s = ss.getSheetByName(areaName);
    if (!s) return { success: false, message: "Sheet not found" };

    // 1. キャッシュ更新のための値の変化を検知
    const prevVal = s.getRange(rowId, 4).getValue();
    const wasDone = prevVal === true || prevVal === "TRUE";
    const nowDone = isDone === true || isDone === "TRUE";
    
    let isDoneChange = 0;
    if (!wasDone && nowDone) {
      isDoneChange = 1;
    } else if (wasDone && !nowDone) {
      isDoneChange = -1;
    }

    // 2. D〜H列を1回のsetValuesでまとめて更新（Sheets API呼び出しを3→1回に削減）
    const now = new Date();
    const completedAt = Utilities.formatDate(now, "JST", "MM/dd HH:mm");
    s.getRange(rowId, 4, 1, 5).setValues([[
      isDone,
      isDone ? completedAt : "",
      isDone ? (parseFloat(count) || 0) : "",
      isDone ? (staffName || "") : "",
      isDone ? (staffId || "") : ""
    ]]);

    // 3. キャッシュの更新
    if (isDoneChange !== 0) {
      try {
        updateAreaCache(areaName, isDoneChange);
        
        // ランキングキャッシュをフラッシュ（次回取得時に再集計）
        const cache = CacheService.getScriptCache();
        cache.remove("RANKING_FAST_CACHE");
        PropertiesService.getScriptProperties().deleteProperty("RANKING_CACHE");
      } catch (e) {
        // キャッシュ更新エラーは無視
      }
    }

    return { success: true };
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

function registerStaff(lastName, firstName) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    throw new Error("サーバーが混雑しています。時間をおいて再度お試しください。");
  }

  try {
    const ss = getSS();
    const s = ss.getSheetByName(CONFIG.SHEET_ROSTER);
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
      values = s.getRange(1, 1, lastRow, 3).getValues();
    }

    // 1. 既存の同名スタッフがいないかチェック (表記揺れ吸収の上で比較)
    for (let i = 1; i < values.length; i++) {
      const rowId = normalizeName(values[i][0]);
      const rowName = normalizeName(values[i][1]);
      const rowAppName = normalizeName(values[i][2]);

      if (rowName === normName && rowAppName === normAppName && rowId !== "") {
        // 既に存在する場合はそのIDを返す (重複防止・ID復元)
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

    // 指定の行に書き込む (A: ID, B: 名前, C: アプリ名)
    s.getRange(targetRow, 1, 1, 3).setValues([[newId, cleanName, cleanAppName]]);

    return { success: true, id: newId, name: fullName, message: "new" };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 個人別配布ランキングのキャッシュデータを取得する（なければ再集計）
 */
function getRankingData() {
  const cache = CacheService.getScriptCache();
  const fastCached = cache.get("RANKING_FAST_CACHE");
  if (fastCached) return JSON.parse(fastCached);

  const props = PropertiesService.getScriptProperties();
  const cached = props.getProperty("RANKING_CACHE");
  if (cached) {
    try {
      const data = JSON.parse(cached);
      cache.put("RANKING_FAST_CACHE", cached, 1800);
      return data;
    } catch (e) {}
  }
  return refreshRankingCache();
}

/**
 * GPS座標と写真データを伴う実績の登録・更新。
 * 送信された写真Base64データをGoogleドライブに「自己記述型ファイル名」で保存し、共有リンクをスプレッドシートに記録する。
 */
function updateRecordWithGPSPhoto(areaName, rowId, isDone, count, latitude, longitude, photoData, staffName, staffId) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    throw new Error("サーバーが混雑しています。時間をおいて再度お試しください。");
  }

  try {
    const ss = getSS();
    const s = ss.getSheetByName(areaName);
    if (!s) return { success: false, message: "Sheet not found" };

    const prevVal = s.getRange(rowId, 4).getValue();
    const wasDone = prevVal === true || prevVal === "TRUE";
    const nowDone = isDone === true || isDone === "TRUE";
    
    let isDoneChange = 0;
    if (!wasDone && nowDone) {
      isDoneChange = 1;
    } else if (wasDone && !nowDone) {
      isDoneChange = -1;
    }

    const now = new Date();
    const completedAt = Utilities.formatDate(now, "JST", "MM/dd HH:mm");

    // D〜H列を1回のsetValuesでまとめて更新（Sheets API呼び出しを4→1回に削減）
    s.getRange(rowId, 4, 1, 5).setValues([[
      isDone,
      isDone ? completedAt : "",
      isDone ? (parseFloat(count) || 0) : "",
      isDone ? (staffName || "") : "",
      isDone ? (staffId || "") : ""
    ]]);

    let photoUrl = "";

    if (isDone) {
      // I列（GPS）の書き込み
      const gpsStr = (latitude && longitude) ? `${latitude},${longitude}` : "";
      s.getRange(rowId, 9).setValue(gpsStr);

      // J列（写真）: photoDataがBase64画像の場合のみDrive保存
      if (photoData && photoData.indexOf("data:image") === 0) {
        try {
          const folderId = CONFIG.STORAGE_PARENT_ID || "17DqCq4hIquqvK96ig8-n6fwb5pTgRE_-";
          const folder = DriveApp.getFolderById(folderId);
          const timeStr = Utilities.formatDate(now, "JST", "HHmm");
          const safeStaffName = staffName ? staffName.replace(/[\s　]/g, "") : "Unknown";
          const fileName = `[${areaName}]_${safeStaffName}_${timeStr}.jpg`;
          const base64Data = photoData.split(",")[1];
          const decoded = Utilities.base64Decode(base64Data);
          const blob = Utilities.newBlob(decoded, "image/jpeg", fileName);
          const file = folder.createFile(blob);
          photoUrl = file.getId();
          s.getRange(rowId, 10).setValue(photoUrl);
        } catch (driveErr) {
          console.error("Google Drive Save Error:", driveErr);
        }
      }
    } else {
      // 完了解除時はGPS・写真URLをクリア
      s.getRange(rowId, 9, 1, 2).setValues([["", ""]]);
    }

    // キャッシュ更新
    if (isDoneChange !== 0) {
      try {
        updateAreaCache(areaName, isDoneChange);
        const cache = CacheService.getScriptCache();
        cache.remove("RANKING_FAST_CACHE");
        PropertiesService.getScriptProperties().deleteProperty("RANKING_CACHE");
      } catch (e) {}
    }

    return {
      success: true,
      photoUrl: photoUrl
    };
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
  var CACHE_KEY = 'DELIVERY_STATS_V1';
  var cache = CacheService.getScriptCache();

  // キャッシュヒット
  try {
    var cached = cache.get(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  // 除外シート名リスト（v2_stats.gs の集計と同じ除外ルール）
  var NON_AREA = [
    CONFIG.SHEET_GUIDE,
    CONFIG.SHEET_ROSTER,
    CONFIG.SHEET_TEMPLATE,
    CONFIG.SHEET_POSTAL,
    CONFIG.SHEET_DISTRICT,
    CONFIG.SHEET_MASTER_EXPORT,
    CONFIG.SHEET_REPORT,
    CONFIG.SHEET_MANUAL,
    CONFIG.SHEET_SYSTEM_CACHE
  ];

  var ss = getSS();
  var sheets = ss.getSheets();

  var totalCompleted = 0;
  var withGPS        = 0;
  var withPhoto      = 0;
  var lastSyncAt     = '';

  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    if (NON_AREA.indexOf(name) !== -1 || sheet.isSheetHidden()) return;

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    // 列構成: A=住所, D=isDone(col4), E=completedAt(col5), F=count(col6),
    //         G=staffName(col7), H=staffId(col8), I=gps(col9), J=photoUrl(col10)
    // D列(index 4)から7列分読み取り → D,E,F,G,H,I,J
    var data = sheet.getRange(2, 4, lastRow - 1, 7).getValues();

    data.forEach(function(row) {
      var isDone   = row[0] === true || row[0] === 'TRUE' || row[0] === 1;
      var complAt  = row[1] ? String(row[1]).trim() : '';  // E列: completedAt
      var gps      = row[5] ? String(row[5]).trim() : '';  // I列 (D=0,E=1,F=2,G=3,H=4,I=5)
      var photoUrl = row[6] ? String(row[6]).trim() : '';  // J列

      if (isDone) {
        totalCompleted++;
        if (gps)      withGPS++;
        if (photoUrl) withPhoto++;
        if (complAt && complAt > lastSyncAt) lastSyncAt = complAt;
      }
    });
  });

  var result = {
    success:        true,
    totalCompleted: totalCompleted,
    withGPS:        withGPS,
    withPhoto:      withPhoto,
    pending:        totalCompleted - withGPS,
    lastSyncAt:     lastSyncAt
  };

  // 60秒キャッシュ
  try { cache.put(CACHE_KEY, JSON.stringify(result), 60); } catch (e) {}

  return result;
}
