/**
 * GAS v2 - 純粋 JSON API エンジン
 * UI(HTML)は一切返却せず、ContentService を通じて JSON のみを応答する。
 */

// =============================
// ⓪ 基本設定
// =============================
function getSS() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss && ss.getId()) return ss;
  } catch (e) {
    // Fallback if not container-bound
  }
  const SPREADSHEET_ID = '1KuA5pN0ItODhwSJph-fwgj_U_ZyHrn9Osew92D99xBs';
  if (!SPREADSHEET_ID) throw new Error("SPREADSHEET_ID is not defined.");
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// =============================
// ① APIエントリポイント
// =============================

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
      case 'getRoster':
        response = getRoster();
        break;
      case 'getAreaDetails':
        response = getAreaDetails(e.parameter.name);
        break;
      case 'submitDistribution':
        response = submitDistribution(
          e.parameter.areaName,
          parseInt(e.parameter.rowId, 10),
          e.parameter.staffName,
          parseFloat(e.parameter.count) || 0,
          e.parameter.isDone === 'true' || e.parameter.isDone === true,
          e.parameter.staffId
        );
        break;
      case 'registerStaff':
        response = registerStaff(e.parameter.lastName, e.parameter.firstName);
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
    // JSONとフォーム送信(urlencoded)でパース方法を安全に切り分け
    if (e.postData && e.postData.contents && e.postData.type === 'application/json') {
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
      case 'getRoster':
        response = getRoster();
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
      case 'registerStaff':
        response = registerStaff(postData.lastName, postData.firstName);
        break;
      case 'forceStartBatch':
        forceStartBatch();
        response = { success: true, message: 'Batch run initiated successfully' };
        break;
      case 'refreshCache':
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
  const ss = getSS();
  const sheets = ss.getSheets();
  
  // 除外するシステムシートのリスト
  const exclude = [
    CONFIG.SHEET_GUIDE, CONFIG.SHEET_ROSTER, CONFIG.SHEET_TEMPLATE,
    CONFIG.SHEET_POSTAL, CONFIG.SHEET_DISTRICT, CONFIG.SHEET_MASTER_EXPORT,
    CONFIG.SHEET_REPORT, CONFIG.SHEET_MANUAL, CONFIG.SHEET_SYSTEM_CACHE
  ];

  let dashboardData;
  try {
    dashboardData = getDashboardData();
  } catch (e) {
    dashboardData = { summary: [] };
  }

  const progressMap = {};
  if (dashboardData && dashboardData.summary) {
    dashboardData.summary.forEach(item => {
      progressMap[item.name] = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0;
    });
  }

  const areas = sheets
    .filter(s => !exclude.includes(s.getName()) && !s.isSheetHidden())
    .map(s => {
      const name = s.getName();
      return {
        name: name,
        progress: progressMap[name] !== undefined ? progressMap[name] : 0
      };
    });

  return {
    success: true,
    branchName: ss.getName().split(/[ 　]/)[0] || "支部",
    areas: areas
  };
}

function getAreaDetails(areaName) {
  if (!areaName) return { success: false, message: "Area name required" };
  const s = getSS().getSheetByName(areaName);
  if (!s) return { success: false, message: "Area not found" };

  const lastRow = s.getLastRow();
  if (lastRow < 2) return { success: true, points: [] };

  const values = s.getRange(2, 1, lastRow - 1, 8).getValues();
  const points = values.map((r, i) => ({
    rowId: i + 2,
    address: r[0],
    memo: r[2],
    isDone: r[3] === true || r[3] === "TRUE",
    completedAt: r[4] ? String(r[4]).trim() : "",
    count: parseFloat(r[5]) || 0,
    staffName: r[6]
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
    const lastName = String(values[i][1] || "").trim();
    const firstName = String(values[i][2] || "").trim();
    
    if (id !== "" && lastName !== "") {
      const fullName = (lastName + " " + firstName).trim();
      roster.push({ id: id, name: fullName });
    }
  }
  return roster;
}

function submitDistribution(areaName, rowId, staffName, count, isDone, staffId) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // 15 seconds maximum wait
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

    // 2. セルの更新 (F列の枚数は count を書き込む。isDone が false の場合はクリア)
    const now = new Date();
    const completedAt = Utilities.formatDate(now, "JST", "MM/dd HH:mm");
    
    // D, E列の更新 (完了、日付)
    s.getRange(rowId, 4, 1, 2).setValues([[isDone, isDone ? completedAt : ""]]);
    // F列（枚数）の更新
    s.getRange(rowId, 6).setValue(isDone ? (parseFloat(count) || 0) : "");
    // G, H列の更新 (担当、スタッフID)
    s.getRange(rowId, 7, 1, 2).setValues([[isDone ? staffName : "", isDone ? (staffId || "") : ""]]);

    // 3. キャッシュの更新
    if (isDoneChange !== 0) {
      try {
        updateAreaCache(areaName, isDoneChange);
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

    const cleanLast = String(lastName || "").trim();
    const cleanFirst = String(firstName || "").trim();
    const normLast = normalizeName(lastName);
    const normFirst = normalizeName(firstName);
    
    if (!cleanLast || !cleanFirst) {
      return { success: false, message: "姓と名を入力してください。" };
    }

    const name = cleanLast + " " + cleanFirst;

    // A列からC列のデータをすべて取得してチェック
    const lastRow = s.getLastRow();
    let values = [];
    if (lastRow >= 1) {
      values = s.getRange(1, 1, lastRow, 3).getValues();
    }

    // 1. 既存の同姓同名スタッフがいないかチェック (表記揺れ吸収の上で比較)
    for (let i = 1; i < values.length; i++) {
      const rowId = normalizeName(values[i][0]);
      const rowLast = normalizeName(values[i][1]);
      const rowFirst = normalizeName(values[i][2]);

      if (rowLast === normLast && rowFirst === normFirst && rowId !== "") {
        // 既に存在する場合はそのIDを返す (重複防止・ID復元)
        return { success: true, id: rowId, name: name, message: "existing" };
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
      const valLast = normalizeName(values[i][1]);
      const valFirst = normalizeName(values[i][2]);

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

      // データ書き込み先として、ヘッダーより下で「ID、苗字、名前がすべて実質空白」の最初の行を再利用する
      if (!foundEmptyRow && valId === "" && valLast === "" && valFirst === "") {
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

    // 指定の行に書き込む (A: ID, B: 苗字, C: 名前)
    s.getRange(targetRow, 1, 1, 3).setValues([[newId, cleanLast, cleanFirst]]);

    return { success: true, id: newId, name: name, message: "new" };
  } finally {
    lock.releaseLock();
  }
}
