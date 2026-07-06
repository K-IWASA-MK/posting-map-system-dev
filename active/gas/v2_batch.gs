/**
 * GAS v2 - バッチ処理モジュール
 * - 大規模データ展開用のバッチエンジン
 * - トリガー管理
 */

// =============================
// ③ バッチ処理 (gas.gs 完全移植)
// =============================

function forceStartBatch() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty("BATCH_STATUS", "running");
  props.setProperty("BATCH_INDEX", "0");
  
  const ss = getSS(); // Web APIでも安全に取得できるよう getSS() を使用
  
  // 1. 最初に巨大CSVから住所を一括展開・ソートして一時シートへ保存
  ss.toast("住所データを抽出・ソート中...", "準備中", 5);
  const addresses = extractDistrictAddresses();
  
  // EXTRACT 完了監査
  if (typeof auditDataIntegrity === 'function') {
    auditDataIntegrity("EXTRACT", addresses);
  }
  
  // デバッグ用トースト：抽出件数を画面に表示
  ss.toast(`【デバッグ】住所データを ${addresses.length} 件抽出しました。ソート中...`, "デバッグ", 10);
  


  /**
   * Area Metadata Foundation (SSOT)
   *
   * cityKana
   * townKana
   * を生成・保持する唯一のマスタ。
   *
   * 他モジュールはこのデータを参照するのみ.
   *
   * DO NOT REGENERATE.
   */
  let tempSheet = ss.getSheetByName("__TEMP_ADDRESSES__");
  if (!tempSheet) {
    tempSheet = ss.insertSheet("__TEMP_ADDRESSES__");
    tempSheet.hideSheet();
  }
  tempSheet.clear();
  tempSheet.getRange(1, 1, 1, 4).setValues([["郵便番号", "住所", "市町村カナ", "町域カナ"]]);
  
  if (addresses.length > 0) {
    const rows = addresses.map(addr => [
      addr.postalCode || "",
      addr.address,
      addr.cityKana || "",
      addr.townKana || ""
    ]);
    tempSheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }
  SpreadsheetApp.flush();
  
  generateAreaSheetsBatch();
}

function generateAreaSheetsBatch() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty("BATCH_STATUS") !== "running") return;
  const startTime = new Date().getTime();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const baseSheet = ss.getSheetByName(CONFIG.get("SHEET_TEMPLATE"));

  // 2. CSV読み込みの代わりに一時シートから高速ロード
  const tempSheet = ss.getSheetByName("__TEMP_ADDRESSES__");
  if (!tempSheet) {
    ss.toast("一時データが見つかりません。一括作成を最初からやり直してください。", "エラー", 5);
    return;
  }
  const lastRow = tempSheet.getLastRow();
  if (lastRow < 2) return;
  
  const tempValues = tempSheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const addresses = tempValues.map(r => ({ postalCode: r[0], address: r[1] }));
  
  const startIndex = parseInt(props.getProperty("BATCH_INDEX")) || 0;
  const chunkSize = CONFIG.get("CHUNK_SIZE");

  // 3. 再開時の状態シミュレーション
  let cityCounts = {};
  let lastCity = "";
  let itemsInBlock = 0; // 1シート内の何件目か (0-9)

  for (let i = 0; i < startIndex; i++) {
    const c = extractCityName(addresses[i].address);
    if (c !== lastCity || itemsInBlock >= chunkSize) {
      cityCounts[c] = (cityCounts[c] || 0) + 1;
      itemsInBlock = 0;
      lastCity = c;
    }
    itemsInBlock++;
  }

  // 4. メインループ
  for (
    let currentIndex = startIndex;
    currentIndex < addresses.length;
    currentIndex++
  ) {
    const now = new Date().getTime();
    if (now - startTime > 260 * 1000) { // 安全のため4.3分で中断
      // 5分制限
      props.setProperty("BATCH_INDEX", currentIndex.toString());
      ScriptApp.newTrigger("generateAreaSheetsBatch")
        .timeBased()
        .after(1000 * 60)
        .create();
      ss.toast(`${currentIndex}件で中断。1分後に自動再開します。`, "中断", 5);
      return;
    }

    const currentAddr = addresses[currentIndex];
    const currentCity = extractCityName(currentAddr.address);

    // 市町村が変わった、または10件に達した場合
    if (currentCity !== lastCity || itemsInBlock >= chunkSize) {
      cityCounts[currentCity] = (cityCounts[currentCity] || 0) + 1;
      itemsInBlock = 0;
      lastCity = currentCity;
    }

    let sheetName =
      cityCounts[currentCity] === 1
        ? currentCity
        : `${currentCity}(${cityCounts[currentCity]})`;
    
    // シートの取得/作成ロジックを堅牢化
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      try {
        sheet = baseSheet.copyTo(ss).setName(sheetName);
        SpreadsheetApp.flush(); // コピーと名前設定を強制同期
      } catch (e) {
        // 重複エラーが発生した場合のリカバリ
        sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          // それでも取得できない場合は名前を少し変えて作成
          sheet = baseSheet.copyTo(ss).setName(sheetName + " ");
          SpreadsheetApp.flush();
        }
      }
    }
    sheet.showSheet();

    // シートの初期化とデザイン適用（新しいシートの開始時のみ）
    if (itemsInBlock === 0) {
      sheet.getRange("A2:L11").clearContent(); // L列（通し番号）まで確実にクリア
      applyProDesign(sheet);
      SpreadsheetApp.flush(); // 初期化を確定
    }

    // 書き込み（絶対に行番号を指定：2〜11行目）
    const targetRow = itemsInBlock + 2;
    const displayAddress = currentAddr.postalCode
      ? `〒${currentAddr.postalCode}\n${currentAddr.address}`
      : currentAddr.address;

    sheet.getRange(targetRow, 1).setValue(displayAddress);
    const mapsUrl =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(currentAddr.address);
    sheet.getRange(targetRow, 2).setFormula(`=HYPERLINK("${mapsUrl}","📍")`);
    sheet.getRange(targetRow, 12).setValue(currentIndex + 2); // 元行番号（L列へ移動）

    itemsInBlock++;
  }

  // 完了処理
  props.deleteProperty("BATCH_STATUS");
  props.deleteProperty("BATCH_INDEX");
  
  // 一時シートの削除
  const tempSheetToDelete = ss.getSheetByName("__TEMP_ADDRESSES__");
  
  // BATCH 完了監査 (一時シートの削除前にマスタの整合性チェック)
  if (tempSheetToDelete) {
    const tempLastRow = tempSheetToDelete.getLastRow();
    if (tempLastRow >= 2) {
      const batchData = tempSheetToDelete.getRange(2, 1, tempLastRow - 1, 4).getValues().map(r => ({
        postalCode: r[0],
        address: r[1],
        cityKana: r[2],
        townKana: r[3]
      }));
      if (typeof auditDataIntegrity === 'function') {
        auditDataIntegrity("BATCH", batchData);
      }
    }
  }
  
  if (tempSheetToDelete) {
    try {
      ss.deleteSheet(tempSheetToDelete);
      SpreadsheetApp.flush();
    } catch (e) {
      // 削除エラーは無視
    }
  }
  
  // シャドウシートを最新のリストで更新
  createSystemCacheSheet();
  SpreadsheetApp.flush();
  
  ss.toast(
    "すべてのエリアシートの展開（市町村境界考慮・10件分割版）が完了しました！",
    "完了",
    10,
  );
  refreshAreaSummaryCache();
}

function createAddressLinks(targetSheet) {
  const sheet =
    targetSheet || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const formulas = values.map((v) => {
    let addr = v[0];
    if (!addr) return [""];
    if (addr.includes("\n")) addr = addr.split("\n")[1];
    const url =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(addr);
    return ['=HYPERLINK("' + url + '","📍")'];
  });
  sheet.getRange(2, 2, formulas.length, 1).setFormulas(formulas);
}

function deleteTriggers(name) {
  ScriptApp.getProjectTriggers().forEach((t) => {
    if (t.getHandlerFunction() === name) ScriptApp.deleteTrigger(t);
  });
}

/**
 * 毎月末（翌月1日の深夜）に自動的に前月のデータを自動消去し、自動ローテーションまたは契約終了を行う
 */
function checkEndOfMonthAndReset() {
  const now = new Date();
  
  // 1日になった日付（午前0時〜1時頃）に実行された場合のみ処理
  if (now.getDate() === 1) {
    const props = PropertiesService.getScriptProperties();
    const disableRollover = props.getProperty("DISABLE_ROLLOVER") === "true";
    
    // 1. 前月データをすべてクリア（リセット。在庫一覧はdeleteAllAreaSheets内では消去されず維持されます）
    deleteAllAreaSheets();
    // シャドウシートも即座に再構築（旧エリア名が残らないよう空状態にする）
    createSystemCacheSheet();
    
    if (disableRollover) {
      // 【契約終了予約がある場合】 ➔ 在庫一覧も含めてデータを完全消去し、システムを完全停止
      const storageSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.get("SHEET_STORAGE") || "チラシ保管庫");
      if (storageSheet) {
        const lastRow = storageSheet.getLastRow();
        if (lastRow >= 2) {
          storageSheet.getRange(2, 1, lastRow - 1, 6).clearContent();
        }
      }
      
      // 自動更新トリガーを全削除
      deleteTriggers("checkEndOfMonthAndReset");
      // 各種管理用プロパティをクリア
      props.deleteProperty("DISABLE_ROLLOVER");
      props.deleteProperty("BATCH_STATUS");
      props.deleteProperty("BATCH_INDEX");
      
      console.warn("ご契約終了に伴い、データを完全消去し、システムを自動停止しました。");
    } else {
      // 【契約継続（通常）の場合】 ➔ 在庫一覧は継続したまま、翌月分のエリアシートを自動で一括再展開
      props.setProperty("BATCH_STATUS", "running");
      props.setProperty("BATCH_INDEX", "0");
      props.setProperty("BATCH_CITY_COUNTS", JSON.stringify({}));
      
      generateAreaSheetsBatch();
      
      console.warn("毎月の自動データ切り替えを実行しました。旧データ消去＆翌月シート自動展開開始。");
    }
  }
}

// =============================================
// Drive写真 自動整理バッチ
// - 90日超: /evidence → /archive へ移動
// - 180日超: /archive 内ファイルをゴミ箱へ
// =============================================

/**
 * Googleドライブの証拠写真を自動整理する。
 * setupCleanupTrigger() で毎日深夜2〜3時に自動実行される。
 */
function cleanupDrivePhotos() {
  const parentFolderId = getStorageFolderId();
  let parentFolder;
  try {
    parentFolder = DriveApp.getFolderById(parentFolderId);
  } catch (e) {
    console.error("cleanupDrivePhotos: parent folder not found:", e);
    return;
  }

  const now = new Date();
  const MS_90_DAYS  = 90  * 24 * 60 * 60 * 1000;
  const MS_180_DAYS = 180 * 24 * 60 * 60 * 1000;

  // --- /evidence フォルダを取得 ---
  const evidenceFolders = parentFolder.getFoldersByName("evidence");
  if (evidenceFolders.hasNext()) {
    const evidenceFolder = evidenceFolders.next();

    // /archive フォルダを取得または作成
    const archiveFolders = parentFolder.getFoldersByName("archive");
    let archiveFolder;
    if (archiveFolders.hasNext()) {
      archiveFolder = archiveFolders.next();
    } else {
      archiveFolder = parentFolder.createFolder("archive");
    }

    // 90日以上経過したファイルを /archive へ移動
    const evidenceFiles = evidenceFolder.getFiles();
    let movedCount = 0;
    while (evidenceFiles.hasNext()) {
      const file = evidenceFiles.next();
      const age = now - file.getDateCreated();
      if (age > MS_90_DAYS) {
        file.moveTo(archiveFolder);
        movedCount++;
      }
    }
    if (movedCount > 0) {
      console.log(`cleanupDrivePhotos: ${movedCount} files moved to /archive`);
    }
  }

  // --- /archive フォルダを取得 ---
  const archiveFolders2 = parentFolder.getFoldersByName("archive");
  if (archiveFolders2.hasNext()) {
    const archiveFolder = archiveFolders2.next();

    // 180日以上経過したファイルをゴミ箱へ
    const archiveFiles = archiveFolder.getFiles();
    let deletedCount = 0;
    while (archiveFiles.hasNext()) {
      const file = archiveFiles.next();
      const age = now - file.getDateCreated();
      if (age > MS_180_DAYS) {
        file.setTrashed(true);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`cleanupDrivePhotos: ${deletedCount} files trashed from /archive`);
    }
  }
}

/**
 * cleanupDrivePhotos の時間主導型トリガーを設定する。
 * GASエディタから手動で1回だけ実行すること。
 * 既存トリガーを削除してから新規作成するため、重複しない。
 */
function setupCleanupTrigger() {
  deleteTriggers("cleanupDrivePhotos");
  ScriptApp.newTrigger("cleanupDrivePhotos")
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();
  console.log("cleanupDrivePhotos trigger set: daily at 2:00 AM JST");
}
