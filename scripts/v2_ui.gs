/**
 * GAS v2 - UI・イベント管理モジュール
 * - メニュー作成 (onOpen)
 * - イベントトリガー (onEdit)
 * - シートデザイン・整形ロジック
 * - 診断機能
 */

// =============================
// ⑤ メニュー & 初期化
// =============================

function onOpen() {
  // スプレッドシートIDをスクリプトプロパティに自動保存（Webアプリからの動的書き込みに必要）
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", ss.getId());
    }
  } catch (e) {
    // エラーは無視
  }

  const ui = SpreadsheetApp.getUi();
  ui.createMenu("⚙️ ポスティング管理")
    .addItem("🚀 エリアシート一括作成", "forceStartBatch")
    .addSeparator()
    .addItem("🔓 スプシの保護・ロックをすべて解除", "removeAllProtections")
    .addItem("🔍 保護・ロックの状況を診断する", "diagnoseProtections")
    .addSeparator()
    .addItem("🗺 司令室マップを開く (司令室用)", "openMapDashboard")
    .addSeparator()
    .addItem("📊 全体数を集計する（ランキング更新）", "aggregateTotalVolumes")
    .addItem("📥 完了データのマスター抽出", "exportAllDataToMasterSheet")
    .addItem("📖 スタッフ用マニュアルを作成", "createManualSheet")
    .addSeparator()
    .addItem("🔄 バッチ処理を強制再開", "forceStartBatch")
    .addItem("⚠️ エリアシートをすべて削除（リセット）", "deleteAllAreaSheets")
    .addSeparator()
    .addItem(
      "🔍 ドライブのファイルを確認する (レスキュー)",
      "diagnoseDriveFiles",
    )
    .addSeparator()
    .addItem(
      "⚡ アプリ起動を高速化（キャッシュ更新）",
      "refreshAreaSummaryCache",
    )
    .addItem("⏰ 自動集計（1時間ごと）を有効化", "setupHourlyRefreshTrigger")
    .addItem("⏰ 毎月末の自動更新を有効化", "setupMonthlyResetTrigger")
    .addItem("🛑 契約終了を予約（今月末で停止）", "toggleContractEndReservation")
    .addSeparator()
    .addItem("🎨 全シートを「プロ仕様」に一斉整形", "formatAllSheets")
    .addItem("🔧 名簿シートを初期化・復旧する", "setupRosterSheet")
    .addSeparator()
    .addItem("📁 ドライブフォルダを自動セットアップ", "setupGoogleDriveFolders")
    .addToUi();
}

/**
 * 定期集計トリガーを設定する
 */
function setupHourlyRefreshTrigger() {
  // 既存のトリガーを掃除
  deleteTriggers("refreshAreaSummaryCache");

  // 1時間おきに実行
  ScriptApp.newTrigger("refreshAreaSummaryCache")
    .timeBased()
    .everyHours(1)
    .create();

  SpreadsheetApp.getUi().alert("1時間おきの自動集計トリガーを設定しました。");
}

/**
 * トリガー
 */
function onEdit(e) {
  if (!e || !e.range) return;
  const range = e.range;
  const sheet = range.getSheet();
  const name = sheet.getName();
  const col = range.getColumn();
  const row = range.getRow();

  // 除外シート
  const exclude = [
    CONFIG.SHEET_GUIDE,
    CONFIG.SHEET_ROSTER,
    CONFIG.SHEET_TEMPLATE,
    CONFIG.SHEET_POSTAL,
    CONFIG.SHEET_DISTRICT,
    CONFIG.SHEET_MASTER_EXPORT,
    CONFIG.SHEET_REPORT,
    CONFIG.SHEET_MANUAL,
    CONFIG.SHEET_STORAGE,
  ];
  if (exclude.includes(name) || sheet.isSheetHidden()) return;

  // D列（完了チェック）が編集された場合
  if (col === 4 && row >= 2) {
    const val = range.getValue();
    const now = Utilities.formatDate(new Date(), "JST", "MM/dd HH:mm");

    // 日時をセット
    sheet.getRange(row, 5).setValue(val ? now : "");

    // サマリーとキャッシュを更新
    updateSheetSummary(sheet);
    updateAreaCache(name, val ? 1 : -1);
  } else if (col === 6 || col === 7) {
    // 枚数や担当が変更された場合
    updateSheetSummary(sheet);
  }
}

/**
 * 【レスキュー機能】ドライブ内のCSVファイルを診断し、表示する
 */
function diagnoseDriveFiles() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let msg = "【ドライブ診断結果】\n\n";
  let count = 0;

  try {
    const files = DriveApp.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const name = file.getName();
      if (
        name.toLowerCase().endsWith(".csv") ||
        file.getMimeType() === MimeType.GOOGLE_SHEETS
      ) {
        msg += `・${name}\n`;
        count++;
      }
      if (count > 20) break; // 探しすぎ防止
    }

    if (count === 0) {
      msg +=
        "CSVファイルが一つも見つかりませんでした。\nファイルをGoogleドライブの『マイドライブ』直下に置いてみてください。";
    } else {
      msg +=
        "\n上記の中に、使いたいファイル名はありますか？\n一字一句（スペース等も含め）同じである必要があります。";
    }
  } catch (e) {
    msg += "エラーが発生しました: " + e.message;
  }

  SpreadsheetApp.getUi().alert(msg);
}

function deleteAllAreaSheets() {
  if (isNotAdmin()) return;

  // 1. バックグラウンドで実行中のバッチ処理タイマーとステータスを完全停止・削除
  deleteTriggers("generateAreaSheetsBatch");
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty("BATCH_STATUS");
  props.deleteProperty("BATCH_INDEX");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const exclude = [
    CONFIG.SHEET_GUIDE,
    CONFIG.SHEET_ROSTER,
    CONFIG.SHEET_TEMPLATE,
    CONFIG.SHEET_POSTAL,
    CONFIG.SHEET_DISTRICT,
    CONFIG.SHEET_STORAGE,
  ];
  ss.getSheets().forEach((s) => {
    if (!exclude.includes(s.getName())) ss.deleteSheet(s);
  });
  
  createSystemCacheSheet();
  refreshAreaSummaryCache();
  
  ss.toast("リセット完了しました。");
}

/**
 * 原本および全エリアシートのデザインを「究極の視認性（シニア対応）」に一斉整形する
 */
function formatAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const template = ss.getSheetByName(CONFIG.SHEET_TEMPLATE);
  const exclude = [
    CONFIG.SHEET_GUIDE,
    CONFIG.SHEET_ROSTER,
    CONFIG.SHEET_TEMPLATE,
    CONFIG.SHEET_POSTAL,
    CONFIG.SHEET_DISTRICT,
    CONFIG.SHEET_MASTER_EXPORT,
    CONFIG.SHEET_REPORT,
    CONFIG.SHEET_MANUAL,
    CONFIG.SHEET_STORAGE,
  ];

  // 1. まずは「原本」を完璧に整える
  applyProDesign(template);

  // 2. 「名簿」を整える
  formatRosterSheet();

  // 3. 他の全エリアシートにも同じデザインを適用
  const sheets = ss.getSheets();
  sheets.forEach((s) => {
    const name = s.getName();
    if (!exclude.includes(name) && !s.isSheetHidden()) {
      applyProDesign(s);
    }
  });

  ss.toast("全シートを「究極の視認性デザイン」に整形しました！");
}

/**
 * 指定したシートにプレミアムデザインを適用する内部関数
 */
function applyProDesign(sheet) {
  if (!sheet) return;

  // 一旦、すべての行と列を表示する（隠れている行を復活させる）
  const maxRowsInit = sheet.getMaxRows();
  const maxColsInit = sheet.getMaxColumns();
  sheet.showRows(1, maxRowsInit);
  sheet.showColumns(1, maxColsInit);

  // 列幅の調整（E,F,Gを重点的に拡大）
  sheet.setColumnWidth(1, 450); // 住所 (A)
  sheet.setColumnWidth(2, 60); // 地図 (B)
  sheet.setColumnWidth(3, 250); // メモ (C)
  sheet.setColumnWidth(4, 60); // 完了 (D)
  sheet.setColumnWidth(5, 180); // 日付 (E) - 拡大
  sheet.setColumnWidth(6, 120); // 枚数 (F) - 拡大
  sheet.setColumnWidth(7, 220); // 担当 (G) - 拡大

  // F列（枚数）のプルダウン（データの入力規則）をクリアして、自由な数字入力に対応させる
  sheet.getRange("F2:F11").clearDataValidations();

  // 行の高さ調整（85pxのゆったりサイズ）
  sheet.setRowHeight(1, 50); // ヘッダー
  const dataRowHeight = 85; // データ行
  sheet.setRowHeights(2, 10, dataRowHeight);

  // セルの書式設定
  const allRange = sheet.getRange("A1:G11");
  allRange
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  // ヘッダーデザイン
  const header = sheet.getRange("A1:G1");
  header
    .setBackground("#1a237e")
    .setFontColor("#ffffff")
    .setFontSize(14)
    .setFontWeight("bold");

  // 住所列の超強調（18pt）
  sheet.getRange("A2:A11").setFontSize(18).setFontWeight("bold");

  // その他のデータ行のフォントサイズ
  sheet.getRange("B2:G11").setFontSize(14).setFontWeight("bold");

  // ストライプデザイン（列ごとの色分け）
  // A, C, E, G, K, L列に薄い色を敷く
  const lightColor = "#f8f9fa";
  sheet.getRange("A2:A11").setBackground(lightColor);
  sheet.getRange("C2:C11").setBackground(lightColor);
  sheet.getRange("E2:E11").setBackground(lightColor);
  sheet.getRange("G2:G11").setBackground(lightColor);
  sheet.getRange("K2:L11").setBackground(lightColor);

  // B, D, F列は白（強調）
  sheet.getRange("B2:B11").setBackground("#ffffff");
  sheet.getRange("D2:D11").setBackground("#ffffff");
  sheet.getRange("F2:F11").setBackground("#ffffff");

  // H列以降（システム用）をすべて非表示にする
  if (maxColsInit > 7) {
    sheet.hideColumns(8, maxColsInit - 7);
  }

  if (maxRowsInit > 11) {
    sheet.hideRows(12, maxRowsInit - 11);
  }
}

/**
 * 名簿シートを「究極の視認性」に整形する
 */
function formatRosterSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_ROSTER);
  if (!sheet) return;

  const maxRows = sheet.getMaxRows();
  const maxCols = sheet.getMaxColumns();

  // 全列を表示させてから、D列以降を隠す
  sheet.showColumns(1, maxCols);
  sheet.setHiddenGridlines(true);

  // 列幅設定 (ID: 100, 名前: 250, アプリ名: 250)
  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 250);
  sheet.setColumnWidth(3, 250);

  if (maxCols > 3) {
    sheet.hideColumns(4, maxCols - 3);
  }

  // ヘッダーデザイン (A1:C1)
  const header = sheet.getRange("A1:C1");
  header
    .setBackground("#1a237e")
    .setFontColor("#ffffff")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 50);

  // データ行のデザイン（1000行分あらかじめ設定）
  const lastRow = 1000;
  const dataRange = sheet.getRange(2, 1, lastRow - 1, 3);
  dataRange
    .setFontSize(18)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground("#ffffff");

  // 行の高さ（全データ行）
  sheet.setRowHeights(2, lastRow - 1, 85);

  ss.toast("名簿シートをプロ仕様に整形しました！");
}

/**
 * 名簿シートを初期化（ID・苗字・名前の3列構成にする）
 */
function setupRosterSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_ROSTER);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_ROSTER);
  }

  // ★ 修正: 一旦全データをクリアして真っ新にする
  sheet.clear();
  sheet.getRange(1, 1, 1, 3).setValues([["ID", "名前", "アプリ名"]]);
  sheet.setFrozenRows(1); // 1行目を固定
  
  formatRosterSheet(); // 整形も同時に行う

  return "名簿シートを真っ新に初期化しました。";
}

/**
 * 管理者権限をチェックする
 */
function isNotAdmin() {
  // 現時点では全員を管理者として扱う（将来的にメールアドレス制限などを入れる場合はここを修正）
  return false;
}

/**
 * 契約終了の月末自動停止の予約・解除を切り替える
 */
function toggleContractEndReservation() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();
  const isScheduled = props.getProperty("DISABLE_ROLLOVER") === "true";

  if (!isScheduled) {
    // 予約されていない場合 ➔ 予約する
    const confirm = ui.alert(
      "🛑 契約終了の予約 (今月末で停止)",
      "今月末（翌月1日の深夜）をもって本システムのご契約を終了し、自動停止しますか？\n\n※今月末までは通常通りエリア地図・リストを利用可能です。月末の自動更新のタイミングでデータが完全削除され、システムが停止します。",
      ui.ButtonSet.YES_NO
    );
    if (confirm === ui.Button.YES) {
      props.setProperty("DISABLE_ROLLOVER", "true");
      ui.alert("契約終了の予約を完了しました。\n今月末まで通常通りご利用いただけます。");
    }
  } else {
    // すでに予約されている場合 ➔ キャンセルする
    const confirm = ui.alert(
      "🔄 契約終了予約のキャンセル (サブスク継続)",
      "すでに今月末での契約終了（自動停止）が予約されています。\n\nこの予約をキャンセルし、来月以降も自動ローテーション（契約継続）しますか？",
      ui.ButtonSet.YES_NO
    );
    if (confirm === ui.Button.YES) {
      props.deleteProperty("DISABLE_ROLLOVER");
      ui.alert("契約終了予約をキャンセルしました。\n来月以降も自動的に今月データがリセットされ、新規シートが作成されます。");
    }
  }
}

/**
 * 毎月末の自動更新トリガーを設定する
 */
function setupMonthlyResetTrigger() {
  // 既存の同名トリガーを掃除
  deleteTriggers("checkEndOfMonthAndReset");

  // 毎日午前0時〜1時の間に実行する日次トリガーを作成
  ScriptApp.newTrigger("checkEndOfMonthAndReset")
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();

  SpreadsheetApp.getUi().alert("⏰ 毎月末（翌月1日深夜）の自動データ更新トリガーを設定しました。\n毎日深夜に自動判定を行い、1日のタイミングでデータのリセットと再展開を行います。");
}

/**
 * 戦況マップダッシュボードを開く
 */
function openMapDashboard() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GOOGLE_MAPS_API_KEY');
  if (!apiKey) { SpreadsheetApp.getUi().alert("APIキー未設定です。"); return; }
  const html = HtmlService.createTemplateFromFile('map_dashboard');
  html.apiKey = apiKey;
  SpreadsheetApp.getUi().showModalDialog(html.evaluate().setWidth(1000).setHeight(700), '戦況マップ');
}

/**
 * スプレッドシート内のすべてのシート・セル範囲の保護（ロック）を完全に解除する
 */
function removeAllProtections() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // SHEET と RANGE の両タイプから保護を取得
  const types = [SpreadsheetApp.ProtectionType.SHEET, SpreadsheetApp.ProtectionType.RANGE];
  let sheetCount = 0;
  let rangeCount = 0;
  let skipCount = 0;

  types.forEach(type => {
    const protections = ss.getProtections(type);
    protections.forEach(p => {
      try {
        if (p.canEdit()) {
          const isSheet = p.getProtectionType() === SpreadsheetApp.ProtectionType.SHEET;
          p.remove();
          SpreadsheetApp.flush(); // 強制的に即時反映してエラーをtry-catchで捕捉
          if (isSheet) {
            sheetCount++;
          } else {
            rangeCount++;
          }
        } else {
          skipCount++;
        }
      } catch (e) {
        console.error("保護の解除に失敗:", e);
      }
    });
  });

  let msg = `シート保護: ${sheetCount}件、範囲保護: ${rangeCount}件 のロックをすべて解除しました。`;
  if (skipCount > 0) {
    msg += ` (権限不足のため ${skipCount}件をスキップしました)`;
  }
  ss.toast(msg, "解除完了", 10);
}

/**
 * シートおよび範囲保護 of 各シートの状況を詳細に診断してアラート表示する
 */
function diagnoseProtections() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  let result = "【スプレッドシート保護状況 診断結果】\n\n";
  
  result += "スプレッドシートID: " + ss.getId() + "\n";
  result += "現在の実行ユーザー: " + Session.getActiveUser().getEmail() + "\n";
  result += "シート数: " + sheets.length + "\n\n";

  sheets.forEach(sheet => {
    result += `■ シート名: "${sheet.getName()}"\n`;
    
    const types = [SpreadsheetApp.ProtectionType.SHEET, SpreadsheetApp.ProtectionType.RANGE];
    let idx = 1;
    
    types.forEach(type => {
      const protections = sheet.getProtections(type);
      protections.forEach(p => {
        const typeStr = p.getProtectionType() === SpreadsheetApp.ProtectionType.SHEET ? "シート全体" : "範囲保護";
        const desc = p.getDescription() || "説明なし";
        let canEditVal = false;
        try {
          canEditVal = p.canEdit();
        } catch (e) {
          canEditVal = "エラー: " + e.message;
        }
        result += `    [${idx}] タイプ: ${typeStr}, 説明: "${desc}", 編集権限(canEdit): ${canEditVal}\n`;
        idx++;
      });
    });
    
    if (idx === 1) {
      result += "  - 保護オブジェクト数: 0\n";
    }
  });

  const ui = SpreadsheetApp.getUi();
  ui.alert("スプシ保護状況の診断結果", result, ui.ButtonSet.OK);
}

/**
 * デモ・本番用のGoogleドライブフォルダ構造を自動セットアップし、スプレッドシートを移動する
 */
function setupGoogleDriveFolders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ssName = ss.getName(); // 例: "MIE-02"
  const folderNameSuffix = "四日市支部"; // 顧客名
  const targetFolderName = `${ssName}_${folderNameSuffix}`; // 例: "MIE-02_四日市支部"
  
  // 1. 親フォルダ「POSTING_MAP_SYSTEM」を探す、なければ作成
  let systemFolder;
  const systemFolders = DriveApp.getFoldersByName("POSTING_MAP_SYSTEM");
  if (systemFolders.hasNext()) {
    systemFolder = systemFolders.next();
  } else {
    systemFolder = DriveApp.createFolder("POSTING_MAP_SYSTEM");
  }
  
  // 2. 「00_TEMPLATE」と「01_ACTIVE_CLIENTS」フォルダを作成
  let templateFolder;
  const templateFolders = systemFolder.getFoldersByName("00_TEMPLATE");
  if (templateFolders.hasNext()) {
    templateFolder = templateFolders.next();
  } else {
    templateFolder = systemFolder.createFolder("00_TEMPLATE");
  }
  
  let activeClientsFolder;
  const activeClientsFolders = systemFolder.getFoldersByName("01_ACTIVE_CLIENTS");
  if (activeClientsFolders.hasNext()) {
    activeClientsFolder = activeClientsFolders.next();
  } else {
    activeClientsFolder = systemFolder.createFolder("01_ACTIVE_CLIENTS");
  }
  
  // 3. 顧客個別フォルダ「MIE-02_四日市支部」を作成
  let clientFolder;
  const clientFolders = activeClientsFolder.getFoldersByName(targetFolderName);
  if (clientFolders.hasNext()) {
    clientFolder = clientFolders.next();
  } else {
    clientFolder = activeClientsFolder.createFolder(targetFolderName);
  }
  
  // 4. 写真格納用フォルダ「MIE-02_STORAGE」を作成
  let storageFolder;
  const storageFolderName = `${ssName}_STORAGE`;
  const storageFolders = clientFolder.getFoldersByName(storageFolderName);
  if (storageFolders.hasNext()) {
    storageFolder = storageFolders.next();
  } else {
    storageFolder = clientFolder.createFolder(storageFolderName);
    // 全員が写真をアップロードできるよう、リンクを知っている全員に編集権限を付与
    storageFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
  }
  
  // 5. スプレッドシート自体を顧客個別フォルダに移動
  const ssFile = DriveApp.getFileById(ss.getId());
  const currentParents = ssFile.getParents();
  while (currentParents.hasNext()) {
    const parent = currentParents.next();
    parent.removeFile(ssFile);
  }
  clientFolder.addFile(ssFile);
  
  // 6. 新しい写真フォルダIDをスクリプトプロパティに設定
  PropertiesService.getScriptProperties().setProperty("STORAGE_PARENT_ID", storageFolder.getId());
  
  ss.toast("フォルダ構造の自動セットアップが完了しました！", "セットアップ完了", 10);
  return `Setup completed. Storage Folder ID: ${storageFolder.getId()}`;
}
